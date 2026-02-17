from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from urllib.parse import urlparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CATALOG_DIR = ROOT / "content" / "catalog" / "entries"
SERVER_LOGO_TS = ROOT / "lib" / "server-logo.ts"
DEFAULT_REPORT = ROOT / "docs" / "catalog-enrich-report.md"
IGNORE_TOKENS = {
    "www",
    "com",
    "dev",
    "mcp",
    "server",
    "servers",
    "local",
    "ops",
    "search",
    "browser",
    "automation",
    "docs",
    "developer",
    "developers",
    "platform",
}


@dataclass(slots=True)
class EntryInfo:
    file_name: str
    slug: str
    name: str
    repo_url: str
    server_url: str


def load_alias_map() -> dict[str, str]:
    if not SERVER_LOGO_TS.exists():
        return {}
    source = SERVER_LOGO_TS.read_text(encoding="utf-8")
    # Matches lines like: openai: "openai",
    pairs = re.findall(r'^\s*([a-z0-9_-]+)\s*:\s*"([^"]+)"\s*,?\s*$', source, flags=re.MULTILINE)
    return {key.lower(): value for key, value in pairs}


def to_host(value: str) -> str:
    if not value:
        return ""
    try:
        parsed = urlparse(value)
        return (parsed.hostname or "").lower()
    except ValueError:
        return ""


def collect_tokens(entry: EntryInfo) -> set[str]:
    tokens: set[str] = set()
    tokens.update(re.findall(r"[a-z0-9]+", entry.slug.lower()))
    tokens.update(re.findall(r"[a-z0-9]+", entry.name.lower()))
    for host in [to_host(entry.repo_url), to_host(entry.server_url)]:
        if host:
            tokens.update(re.findall(r"[a-z0-9]+", host))
    return {token for token in tokens if len(token) >= 3 and token not in IGNORE_TOKENS}


def write_report(report_path: Path, entries: list[EntryInfo], alias_map: dict[str, str], unresolved_by_file: dict[str, list[str]]) -> None:
    report_lines: list[str] = [
        "# Catalog Enrichment Report",
        "",
        f"- Entries scanned: `{len(entries)}`",
        f"- Known logo aliases: `{len(alias_map)}`",
        "",
        "## Missing alias hints",
        "",
    ]
    unresolved_total = 0
    for entry in entries:
        unresolved = unresolved_by_file.get(entry.file_name, [])
        if not unresolved:
            continue
        unresolved_total += len(unresolved)
        report_lines.append(f"- **{entry.file_name}** (`{entry.name}`): `{', '.join(unresolved)}`")

    if unresolved_total == 0:
        report_lines.append("- No missing alias hints detected.")

    report_lines.extend(
        [
            "",
            "## Suggested next step",
            "",
            "Add missing aliases into `lib/server-logo.ts` (`simpleIconSlugByAlias`) for unresolved brand tokens.",
            "",
        ]
    )

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(report_lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Catalog enrichment helper (dry-run by default).")
    parser.add_argument("--dry-run", action="store_true", help="Only print suggestions; do not write files.")
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT, help="Output markdown report path.")
    args = parser.parse_args()

    if not CATALOG_DIR.exists():
        print(f"[catalog_enrich] catalog directory not found: {CATALOG_DIR}")
        return 1

    alias_map = load_alias_map()
    files = sorted(CATALOG_DIR.glob("*.json"))
    print(f"[catalog_enrich] scanned files: {len(files)}")
    print(f"[catalog_enrich] known aliases: {len(alias_map)}")

    changed = 0
    entries: list[EntryInfo] = []
    unresolved_by_file: dict[str, list[str]] = {}
    for file_path in files:
        payload = json.loads(file_path.read_text(encoding="utf-8"))
        entry = EntryInfo(
            file_name=file_path.name,
            slug=str(payload.get("slug", "")),
            name=str(payload.get("name", "")),
            repo_url=str(payload.get("repoUrl", "")),
            server_url=str(payload.get("serverUrl", "")),
        )
        entries.append(entry)

        tags = list(dict.fromkeys(payload.get("tags", [])))
        normalized_tags = [str(tag).strip().lower() for tag in tags if str(tag).strip()]
        if normalized_tags != payload.get("tags", []):
            payload["tags"] = normalized_tags
            changed += 1
            if not args.dry_run:
                file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"[catalog_enrich] normalized tags -> {file_path.name}")

        tokens = collect_tokens(entry)
        unresolved_tokens = sorted(token for token in tokens if token not in alias_map)
        if unresolved_tokens:
            unresolved_by_file[file_path.name] = unresolved_tokens[:6]

    report_path = args.report if args.report.is_absolute() else ROOT / args.report
    write_report(report_path, entries, alias_map, unresolved_by_file)
    print(f"[catalog_enrich] report -> {report_path}")

    if args.dry_run:
        print(f"[catalog_enrich] dry-run complete. potential changes: {changed}")
    else:
        print(f"[catalog_enrich] write complete. changed files: {changed}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
