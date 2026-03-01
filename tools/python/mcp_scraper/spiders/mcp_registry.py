from __future__ import annotations

import json
import os
import re
from typing import Any

import scrapy


DEFAULT_REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0.1/servers"


def _to_slug(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")[:90]


def _to_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _pick_string(payload: dict[str, Any], keys: list[str]) -> str:
    for key in keys:
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


class McpRegistrySpider(scrapy.Spider):
    name = "mcp_registry"
    allowed_domains = ["registry.modelcontextprotocol.io"]

    async def start(self):
        registry_url = os.getenv("MCP_SCRAPY_REGISTRY_URL", DEFAULT_REGISTRY_URL).strip() or DEFAULT_REGISTRY_URL
        yield scrapy.Request(registry_url, callback=self.parse_registry)

    @staticmethod
    def _entry_rank(payload: dict[str, Any], record: dict[str, Any]) -> tuple[int, str, str]:
        official_meta = {}
        root_meta = record.get("_meta")
        if isinstance(root_meta, dict):
            candidate = root_meta.get("io.modelcontextprotocol.registry/official")
            if isinstance(candidate, dict):
                official_meta = candidate

        is_latest = 1 if official_meta.get("isLatest") is True else 0
        updated_at = str(official_meta.get("updatedAt") or "")
        published_at = str(official_meta.get("publishedAt") or "")
        version = str(payload.get("version") or "")
        return (is_latest, updated_at or published_at, version)

    def parse_registry(self, response: scrapy.http.Response):
        data = json.loads(response.text)

        records: list[dict[str, Any]]
        if isinstance(data, list):
            records = [row for row in data if isinstance(row, dict)]
        elif isinstance(data, dict):
            for key in ["servers", "items", "data", "results"]:
                value = data.get(key)
                if isinstance(value, list):
                    records = [row for row in value if isinstance(row, dict)]
                    break
            else:
                records = [data]
        else:
            records = []

        dedupe_enabled = os.getenv("MCP_SCRAPY_DEDUPE_BY_SLUG", "1").strip().lower() not in {"0", "false", "no"}
        selected_by_slug: dict[str, tuple[tuple[int, str, str], dict[str, Any], dict[str, Any]]] = {}
        fallback_items: list[tuple[dict[str, Any], dict[str, Any]]] = []

        for record in records:
            payload = record.get("server") if isinstance(record.get("server"), dict) else record
            repository = payload.get("repository") if isinstance(payload.get("repository"), dict) else {}

            raw_name = _pick_string(payload, ["title", "name", "display_name"])
            raw_slug = _pick_string(payload, ["name", "slug", "id", "key"])
            description = _pick_string(payload, ["description", "summary", "tagline"])
            repo_url = _pick_string(repository, ["url"]) or _pick_string(
                payload, ["repo_url", "repoUrl", "source_url", "github_url"]
            )
            server_url = _pick_string(payload, ["server_url", "serverUrl", "websiteUrl", "homepage", "url"])

            name = raw_name or raw_slug or "Unnamed MCP Server"
            slug = _to_slug(raw_slug or raw_name or name)
            if not slug:
                continue

            tags = sorted(set(["registry-auto", "scrapy-sync", *[t.lower() for t in _to_list(payload.get("tags"))]]))
            item = {
                "name": name[:120],
                "slug": slug,
                "description": (description or f"Imported by Scrapy from {response.url}.")[:800],
                "repo_url": repo_url or None,
                "server_url": server_url or repo_url or None,
                "tags": tags[:12],
                "raw": record,
            }
            if dedupe_enabled:
                rank = self._entry_rank(payload, record)
                current = selected_by_slug.get(slug)
                if current is None or rank > current[0]:
                    selected_by_slug[slug] = (rank, item, payload)
            else:
                fallback_items.append((item, payload))

        if dedupe_enabled:
            for _, item, _ in selected_by_slug.values():
                yield item
        else:
            for item, _ in fallback_items:
                yield item
