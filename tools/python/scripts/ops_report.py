from __future__ import annotations

import argparse
from datetime import UTC, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUTPUT = ROOT / "docs" / "python-ops-report.md"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a simple ops markdown report.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output markdown path")
    args = parser.parse_args()

    now = datetime.now(UTC).isoformat()
    report = (
        "# Python Ops Report\n\n"
        f"- Generated at: `{now}`\n"
        f"- Repo root: `{ROOT}`\n"
        "- Status: automation scaffold active\n"
    )

    output_path = args.output
    if not output_path.is_absolute():
        output_path = ROOT / output_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    print(f"[ops_report] wrote: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
