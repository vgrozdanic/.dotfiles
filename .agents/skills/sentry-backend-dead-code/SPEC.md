# Sentry Backend Dead Code Specification

## Intent

Find high-value dead Python code in Sentry without breaking GetSentry, self-hosted installs, dynamic framework roots, or operational entry points. Turn static candidates into verified cleanup work.

## Scope

In scope:

- Sentry backend Python under `src/sentry`.
- GetSentry Python as downstream consumer.
- Production-versus-test Vulture comparison.
- Cross-repo reference checks, history review, false-positive rejection, and cleanup checklists.

Out of scope:

- Frontend code.
- Automatic source deletion.
- Database schema cleanup.
- Installing audit dependencies.
- Proving all dead code has been found.

## Users And Trigger Context

- Primary users: Sentry engineers and coding agents planning backend cleanup.
- Common requests: find dead backend code, audit unused Python, run Vulture, verify test-only code, or write cleanup checklist.
- Should not trigger for: frontend dead code, unused package dependencies, general bug review, or deleting one already-verified symbol.

## Runtime Contract

- Read Sentry and GetSentry instructions first.
- Run bundled scanner from Sentry root with existing local Vulture.
- Treat generated findings as candidates only.
- Verify important candidates across code, configuration, history, GitHub organization search, and open PRs.
- Reject dynamic roots and historical migration contracts.
- Store generated reports under `.git`; persist only requested checklist.
- Return ranked findings, rejected false positives, and unresolved gaps.

## Source And Evidence Model

Authoritative sources:

- Current Sentry and GetSentry source and tests.
- Sentry, GetSentry, ops, self-hosted, and options automator configuration.
- Git history and open PR state.
- Registration decorators, settings strings, task names, and migration contracts.

Useful evidence:

- Vulture production and test-inclusive reports.
- GitHub organization code search.
- Runtime telemetry for code with a valid but questionable entry point.
- Domain owner confirmation for manual repair code.

Do not store secrets, customer information, or unrelated private identifiers.

## Reference Architecture

- `SKILL.md` contains complete runtime workflow and script contract.
- `SPEC.md` contains maintenance contract.
- `SOURCES.md` contains provenance, decisions, trigger tests, and gaps.
- `scripts/dead_code_audit.py` runs and compares deterministic scans.
- No runtime references or assets are required.

## Validation

- Run skill structural validator.
- Run `python -m py_compile scripts/dead_code_audit.py`.
- Run bundled script from Sentry root when local Vulture and GetSentry checkout exist.
- Confirm script reproduces raw candidate counts and reports zero unparsed lines.
- Confirm skill routes dynamic roots to rejection or manual verification.

## Known Limitations

- Vulture uses name matching and produces both false positives and false negatives.
- Dynamic Django and Celery roots require manual review.
- Local checkout search cannot prove absence from every private repository.
- Runtime telemetry cannot cover self-hosted or rare manual operations.
- Existing local Vulture executable may not exist in every environment.

## Maintenance Notes

- Update `SKILL.md` when scan flow, verification roots, safety rules, or output contract changes.
- Update script when Vulture output format or repository layout changes.
- Update `SOURCES.md` when new false-positive classes or verified failure cases appear.
- Keep script dependency-free and do not add Vulture to project dependencies solely for this skill.
