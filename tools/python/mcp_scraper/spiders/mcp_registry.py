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

    def start_requests(self):
        registry_url = os.getenv("MCP_SCRAPY_REGISTRY_URL", DEFAULT_REGISTRY_URL).strip() or DEFAULT_REGISTRY_URL
        yield scrapy.Request(registry_url, callback=self.parse_registry)

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

        for record in records:
            raw_name = _pick_string(record, ["name", "title", "display_name"])
            raw_slug = _pick_string(record, ["slug", "id", "key"])
            description = _pick_string(record, ["description", "summary", "tagline"])
            repo_url = _pick_string(record, ["repo_url", "repoUrl", "repository", "source_url", "github_url"])
            server_url = _pick_string(record, ["server_url", "serverUrl", "homepage", "url"])

            name = raw_name or raw_slug or "Unnamed MCP Server"
            slug = _to_slug(raw_slug or raw_name or name)
            if not slug:
                continue

            tags = sorted(set(["registry-auto", "scrapy-sync", *[t.lower() for t in _to_list(record.get("tags"))]]))

            yield {
                "name": name[:120],
                "slug": slug,
                "description": (description or f"Imported by Scrapy from {response.url}.")[:800],
                "repo_url": repo_url or None,
                "server_url": server_url or repo_url or None,
                "tags": tags[:12],
                "raw": record,
            }
