---
name: sentry-backend-dead-code
description: Audits Sentry backend Python for dead code while treating GetSentry as a downstream consumer. Use when asked to find dead backend code, run Vulture across Sentry and GetSentry, verify unused Python, investigate test-only code, or produce a dead-code cleanup checklist. Rejects dynamic Django, Celery, settings, registry, and migration false positives before recommending deletion.
---

# Sentry Backend Dead Code

Generate candidates, verify strongest findings, and write an evidence-backed cleanup checklist. Do not promise complete dead-code detection.

## Preconditions

- Run from Sentry repository root.
- Read root `AGENTS.md`, `src/AGENTS.md`, and sibling GetSentry `AGENTS.md`.
- Inspect worktree state. Do not alter or overwrite unrelated user files.
- Require sibling GetSentry checkout, normally `../getsentry`.
- Require existing `.venv/bin/vulture`. Do not add Vulture or another dependency.
- Resolve `scripts/dead_code_audit.py` against this skill directory before running it.

## Bundled script

Run from Sentry repository root:

```bash
.venv/bin/python <resolved-skill-path>/scripts/dead_code_audit.py
```

Optional arguments:

```text
--getsentry PATH   GetSentry repository, default ../getsentry
--vulture PATH     Existing Vulture executable, default .venv/bin/vulture
--output PATH      Output directory, default .git/dead-code-audit/<date>-<sha>
--top N            Large-candidate rows per TSV, default 250
```

Script runs two non-interactive scans:

1. Sentry and GetSentry production source.
2. Same source plus both test trees.

Script writes:

- `vulture-production.txt`
- `vulture-with-tests.txt`
- `candidates.csv`
- `summary.json`
- `metadata.json`
- `largest-production-only.tsv`
- `largest-still-reported-with-tests.tsv`

Vulture returns exit code 3 when it finds candidates; script treats that as success. If script or Vulture is unavailable, stop and report blocker. Do not install or register a dependency.

## Workflow

### 1. Run scan

Run bundled script. Read `summary.json` and both largest-candidate TSV files. Keep generated files under `.git` unless user requests another location.

Treat counts as candidate volume, not removable line count. Vulture matches names globally and cannot resolve many dynamic roots.

### 2. Rank candidates

Prefer candidates with:

1. Large removable source and test islands.
2. Private symbols or whole modules.
3. References only from tests.
4. A caller removed in recent history.
5. No decorator, settings, command, registry, or migration root.

Do not rank confidence percentage alone. High-confidence callback arguments often cannot be removed.

### 3. Verify references

For each important candidate, search both symbol and full module path across:

- `src` and `tests`
- `../getsentry/getsentry` and `../getsentry/tests`
- `../ops`
- `../self-hosted`
- `../sentry-options-automator`
- Job manifests and configuration

Use GitHub organization code search when authenticated. Check private consumers beyond local checkouts. Never post comments or replies.

### 4. Trace history

Use `git log -S`, `git log -G`, `git blame`, and relevant commit diffs to answer:

- Which caller used this code?
- When did caller disappear?
- Did cleanup leave implementation and tests behind?
- Does open PR already remove it?
- Did code exist only as speculative preparation?

Check open PRs before creating duplicate work.

### 5. Reject dynamic roots

Reject or defer candidate when any root remains:

| Root | Check |
|---|---|
| Settings backend | Search class and full import string in Sentry, GetSentry, and self-hosted settings |
| Celery task | Check task decorator name, beat schedules, and job manifests |
| Django hook | Check middleware, app config, URL, management command, signal, and model registration |
| Serializer or plugin | Check registration decorators and import-for-side-effect comments |
| CLI command | Check Click decorators and command registration |
| Historical migration | Check old self-hosted upgrade paths and hard-stop requirements |
| Public extension | Check documented API and plugin contracts |
| Manual repair path | Ask owner when code may run only from Django shell or incident procedures |

Tests prove behavior, not production reachability. Test-only use strengthens a candidate but does not prove deletion safety.

### 6. Classify findings

Use these confidence levels:

- **High:** no production or external reference, no dynamic root, and history explains orphaning.
- **Medium:** no static reference, but manual, public, or rare operational use remains possible.
- **Rejected:** configuration, decorator, registry, migration, task, command, or external consumer proves reachability.

For Sentry symbols used by GetSentry, remove and deploy GetSentry consumer before deleting Sentry provider.

### 7. Write checklist

Write or update `backend-python-dead-code-checklist.md` only when user requests a persisted checklist. Use one section per candidate:

````markdown
### <candidate>

**Estimate:** <lines>
**Confidence:** <high|medium>

- [ ] <deletion step>
- [ ] <test cleanup>
- [ ] <validation command>

Evidence:
- <cross-repo reference result>
- <history result>
- <dynamic-root result>
- <open PR result>

```text
<production callgraph showing missing or removed root>
```
````

Keep rejected false positives in a short guard section so later audits do not repeat work. Do not add raw generated reports to git.

## Safety boundaries

- Audit only unless user explicitly asks for deletions.
- Never delete historical migrations based on static analysis.
- Never treat zero references as proof for public or manual operational interfaces.
- Never add dependencies for audit.
- Never include customer information in reports or checklists.
- Keep frontend out of scope.

## Completion report

Return:

1. Audit output directory and checklist path.
2. Raw candidate counts with noise warning.
3. Verified findings ranked by removable scope.
4. Important rejected false positives.
5. Manual confirmation or telemetry gaps.
6. Validation run for bundled script or changed checklist.
