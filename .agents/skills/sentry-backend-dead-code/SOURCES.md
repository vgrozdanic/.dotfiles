# Sources And Decisions

## Classification

- Skill class: `workflow-process`.
- Primary shape: `script-backed-workflow`.
- Secondary shape: fixed ordered verification flow in `SKILL.md`.
- Simpler shape rejected: inline shell cannot reliably run two scans, parse Vulture output, compare findings, and preserve structured artifacts.
- Portability: workflow is provider-neutral. Script expects Sentry repository layout and existing local Vulture executable.

## Source Inventory

| Source | Trust | Contribution | Constraints |
|---|---|---|---|
| Sentry root `AGENTS.md` | authoritative | Python command, validation, customer data, GetSentry deployment rules | Read current checkout each run |
| Sentry `src/AGENTS.md` | authoritative | Backend architecture and safety rules | Read current checkout each run |
| GetSentry `AGENTS.md` | authoritative | Downstream dependency and dynamic extension model | Read sibling checkout each run |
| `tools/dead_code_audit.py` from initial audit | empirical | Two-pass scan, parser, structured output | Vulture 2.16 output format |
| `backend-python-dead-code-checklist.md` from initial audit | empirical | Verification flow, false-positive classes, checklist format | Findings age; do not hardcode as current truth |
| Initial Sentry/GetSentry audit results | empirical | Candidate ranking and rejected-root examples | Valid at recorded revisions only |
| Git history and GitHub code search | authoritative for checked revisions | Caller removal, private consumers, duplicate PR checks | Authentication and repository visibility apply |
| Skill Writer references | authoritative | Script-backed layout, SPEC, trigger, and validation requirements | Maintenance-only guidance |

## Decisions

### Adopted

- Scan Sentry and GetSentry together.
- Compare production-only scan with test-inclusive scan.
- Store generated reports under Git metadata by default.
- Rank by removable islands and historical orphan evidence, not Vulture confidence alone.
- Require exact symbol and module-path searches.
- Reject settings, decorators, tasks, commands, registries, and migrations as static false positives.
- Ask for owner confirmation when manual Django-shell use remains plausible.
- Keep audit separate from deletion unless user explicitly requests implementation.

### Rejected

- Add Vulture to Sentry dependencies.
- Build custom Python reachability analyzer.
- Treat tests as production reachability.
- Treat no static references as proof for public or operational interfaces.
- Commit raw scanner output.
- Encode initial verified findings as permanent runtime truth.

### Deferred

- Runtime telemetry automation. Candidate entry points and tags vary by subsystem.
- GitHub organization search automation. Authentication and private repository access vary.
- Automatic checklist updates. Manual evidence judgment remains required.

## Coverage Matrix

| Dimension | Status | Evidence |
|---|---|---|
| Preconditions | covered | repository root, sibling checkout, local Vulture |
| Ordered flow | covered | scan, rank, search, history, reject, classify, checklist |
| Failure handling | covered | stop without installing dependencies; report missing tools or repos |
| Safety boundaries | covered | migrations, dynamic roots, public APIs, customer data, audit-only default |
| Negative behavior | covered | known false-positive classes and rejected shortcuts |
| Repair pattern | covered | caller-history proof and GetSentry-first removal order |
| Version variance | covered | Vulture output and repository layout limitations |
| Structured output | covered | CSV, JSON, TSV, raw reports, checklist contract |

## Trigger Tests

Should trigger:

- “Find dead Python code in Sentry backend.”
- “Run Vulture across Sentry and GetSentry and verify results.”
- “Which backend modules are used only by tests?”
- “Create cleanup checklist for unused Sentry Python.”
- “Audit backend dead code without breaking GetSentry.”

Should not trigger:

- “Find unused React components.”
- “Remove unused pip dependencies.”
- “Review this Django endpoint for authorization bugs.”
- “Delete this already-confirmed obsolete function.”
- “Find dead code in a non-Sentry Python repository.”

Description edits:

- Name Sentry backend and GetSentry consumer explicitly to avoid generic Python audits.
- Include Vulture, test-only code, and cleanup checklist phrases for recall.
- Name dynamic framework false positives to signal verification behavior.

## Gaps And Stopping Rationale

- No automated runtime telemetry query exists because each subsystem exposes different signals.
- No external Vulture research was needed; observed Vulture 2.16 behavior and reproducible output define current script contract.
- Further source retrieval is low-yield until script output format, repository layout, or false-positive patterns change.
