#!/usr/bin/env python3
"""Generate and compare Sentry/GetSentry Vulture reports.

Vulture is intentionally not a project dependency. This script uses the existing
`.venv/bin/vulture` executable, or a path supplied with `--vulture`.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
from collections import Counter
from collections.abc import Sequence
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

FINDING_PATTERN = re.compile(r"^(.*):(\d+): (.*) \((\d+)% confidence, (\d+) lines?\)$")
NAME_PATTERN = re.compile(r"^unused (\w+) '([^']+)'$")


@dataclass(frozen=True)
class Finding:
    repo: str
    path: str
    line: int
    kind: str
    symbol: str
    finding: str
    confidence: int
    lines: int

    @property
    def key(self) -> tuple[str, int, str]:
        return self.path, self.line, self.finding


def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(repo), *args], text=True, stderr=subprocess.DEVNULL
    ).strip()


def run_vulture(
    repo: Path,
    vulture: Path,
    paths: Sequence[str],
    output: Path,
) -> None:
    command = [str(vulture), *paths, "--min-confidence", "60", "--sort-by-size"]
    with output.open("w") as stdout, output.with_suffix(".stderr.txt").open("w") as stderr:
        result = subprocess.run(command, cwd=repo, stdout=stdout, stderr=stderr, check=False)
    # Vulture returns 3 when it finds dead-code candidates.
    if result.returncode not in (0, 3):
        raise RuntimeError(
            f"Vulture failed with exit code {result.returncode}: {' '.join(command)}"
        )


def parse_findings(path: Path, getsentry: Path) -> tuple[list[Finding], int]:
    findings: list[Finding] = []
    unparsed = 0
    for raw in path.read_text().splitlines():
        match = FINDING_PATTERN.match(raw)
        if match is None:
            unparsed += 1
            continue
        filename, line, message, confidence, lines = match.groups()
        named = NAME_PATTERN.match(message)
        kind, symbol = named.groups() if named else (message.split()[0], "")
        findings.append(
            Finding(
                repo="getsentry" if str(getsentry) in filename else "sentry",
                path=filename,
                line=int(line),
                kind=kind,
                symbol=symbol,
                finding=message,
                confidence=int(confidence),
                lines=int(lines),
            )
        )
    return findings, unparsed


def write_csv(path: Path, production: list[Finding], test_keys: set[tuple[str, int, str]]) -> None:
    fields = [*Finding.__dataclass_fields__, "reported_with_tests"]
    with path.open("w", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        for finding in production:
            writer.writerow({**asdict(finding), "reported_with_tests": finding.key in test_keys})


def write_largest(
    path: Path,
    findings: list[Finding],
    test_keys: set[tuple[str, int, str]],
    reported_with_tests: bool,
    limit: int,
) -> None:
    selected = [
        finding for finding in findings if (finding.key in test_keys) is reported_with_tests
    ]
    selected.sort(key=lambda finding: (-finding.lines, finding.path, finding.line))
    with path.open("w") as output:
        output.write("lines\tconfidence\trepo\tkind\tsymbol\tpath:line\n")
        for finding in selected[:limit]:
            output.write(
                f"{finding.lines}\t{finding.confidence}\t{finding.repo}\t{finding.kind}\t"
                f"{finding.symbol}\t{finding.path}:{finding.line}\n"
            )


def counter(values: Sequence[Any]) -> dict[Any, int]:
    return dict(sorted(Counter(values).items(), key=lambda item: str(item[0])))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--getsentry", type=Path, default=Path("../getsentry"))
    parser.add_argument("--vulture", type=Path, default=Path(".venv/bin/vulture"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--top", type=int, default=250)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo = Path.cwd().resolve()
    getsentry = args.getsentry.resolve()
    vulture = args.vulture.resolve()

    if not (repo / "src/sentry").is_dir():
        raise SystemExit("Run from Sentry repository root")
    if not (getsentry / "getsentry").is_dir():
        raise SystemExit(f"GetSentry source not found: {getsentry}")
    if not vulture.is_file():
        raise SystemExit(f"Vulture executable not found: {vulture}")

    git_dir = Path(git(repo, "rev-parse", "--git-dir"))
    if not git_dir.is_absolute():
        git_dir = repo / git_dir
    output = args.output or (
        git_dir
        / "dead-code-audit"
        / f"{datetime.now(UTC):%Y-%m-%d}-{git(repo, 'rev-parse', '--short=12', 'HEAD')}"
    )
    output.mkdir(parents=True, exist_ok=True)

    production_path = output / "vulture-production.txt"
    with_tests_path = output / "vulture-with-tests.txt"
    run_vulture(
        repo,
        vulture,
        ["src/sentry", str(getsentry / "getsentry")],
        production_path,
    )
    run_vulture(
        repo,
        vulture,
        ["src/sentry", "tests/sentry", str(getsentry / "getsentry"), str(getsentry / "tests")],
        with_tests_path,
    )

    production, production_unparsed = parse_findings(production_path, getsentry)
    with_tests, tests_unparsed = parse_findings(with_tests_path, getsentry)
    test_keys = {finding.key for finding in with_tests}

    write_csv(output / "candidates.csv", production, test_keys)
    write_largest(
        output / "largest-production-only.tsv",
        production,
        test_keys,
        reported_with_tests=False,
        limit=args.top,
    )
    write_largest(
        output / "largest-still-reported-with-tests.tsv",
        production,
        test_keys,
        reported_with_tests=True,
        limit=args.top,
    )

    summary = {
        "production_candidates": len(production),
        "with_tests_candidates": len(with_tests),
        "production_only_candidates": sum(finding.key not in test_keys for finding in production),
        "production_candidate_lines": sum(finding.lines for finding in production),
        "unparsed_lines": {
            "production": production_unparsed,
            "with_tests": tests_unparsed,
        },
        "by_repo": counter([finding.repo for finding in production]),
        "by_kind": counter([finding.kind for finding in production]),
        "by_confidence": counter([finding.confidence for finding in production]),
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    (output / "metadata.json").write_text(
        json.dumps(
            {
                "created_at": datetime.now(UTC).isoformat(),
                "sentry": git(repo, "rev-parse", "HEAD"),
                "getsentry": git(getsentry, "rev-parse", "HEAD"),
                "vulture": subprocess.check_output([str(vulture), "--version"], text=True).strip(),
            },
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )

    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
