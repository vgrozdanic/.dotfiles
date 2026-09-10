---
name: agent-monitoring-small-refactor
description: Audits Sentry's Agent Monitoring product code and implements one small, behavior-preserving maintainability improvement. Use when asked to find a same-day refactor, small cleanup, or review-ready maintenance win in Agent Insights, AI Conversations, or ai_monitoring code.
---

# Agent Monitoring Small Refactor

Find and implement one focused Agent Monitoring refactor that can plausibly merge the
same day. Optimize for behavioral confidence and reviewer ease, not audit breadth or
lines removed.

## Scope

Audit these areas:

- `static/app/views/insights/pages/agents`
- Agent model and tool insights pages
- AI dashboard configurations
- Conversations frontend and API code
- `src/sentry/ai_monitoring`
- `src/sentry/tasks/ai_agent_monitoring.py`
- Tests directly covering candidate code

Exclude:

- Seer, Autofix, coding-agent integrations, agentic triage, and MCP
- Generic tracing infrastructure not owned by Agent Monitoring
- Features, behavior-changing bug fixes, and broad architecture work

## Change Budget

- Preserve observable behavior.
- Touch at most two production files. Focused test files do not count toward this limit.
- Target fewer than 100 changed lines.
- Keep the change entirely frontend or entirely backend because they are not atomically
  deployed.
- Do not add migrations, schema or API contract changes, feature flags, dependencies, or
  broad renames.
- Do not commit, open a pull request, or merge.
- Avoid files containing unrelated local changes. Never revert or rewrite user work.

## Workflow

1. Read the root `AGENTS.md` and the applicable frontend, backend, or test instructions.
2. Inspect worktree state and current Agent Monitoring code before forming candidates.
3. Identify three to five evidence-backed refactor candidates.
4. Reject candidates that exceed the change budget, cross deployment boundaries, lack
   focused verification, or require assumptions about intended behavior.
5. Rank the remaining candidates by maintainability gain, behavioral confidence, existing
   test coverage, diff size, and reviewer context required.
6. State the selected candidate and why it beats the alternatives, then implement it
   without waiting for another prompt.
7. Make the smallest clear change. Add tests only when existing coverage cannot establish
   behavior preservation.
8. Run focused tests and lint, then repository-required changed-file validation.
9. Review the final diff for scope creep, unrelated edits, and behavior changes.
10. Simplify or abandon the implementation and evaluate the next candidate if it breaches
    the budget.

## Candidate Preferences

Prefer, in order:

1. Reuse an existing helper instead of duplicating domain fallback logic.
2. Consolidate repeated pure query or formatting construction.
3. Simplify branching or data transformation without changing outputs.
4. Remove a redundant local abstraction.
5. Tighten types without changing runtime behavior.

Do not preserve rejected candidates as a backlog. Re-audit current code on each invocation
so stale opportunities do not bias selection.

## Validation

For frontend changes:

- Run the narrowest relevant `pnpm test-ci` target.
- Run `pnpm run lint:js` for changed frontend files.
- Run repository-required `.venv/bin/prek run -q` validation.

For backend changes:

- Run the narrowest relevant `.venv/bin/pytest` target.
- Run relevant ruff or mypy hooks through `.venv/bin/prek` when applicable.
- Run repository-required `.venv/bin/prek run -q` validation.

Before completion, confirm:

- At most two production files changed.
- The diff remains under the target size.
- Frontend and backend production files are not mixed.
- Focused tests and lint pass, or any pre-existing failure is clearly distinguished.
- The final diff contains no unrelated edits or observable behavior change.

## Stop Conditions

Stop without forcing a change when:

- No candidate satisfies the scope and confidence requirements.
- Qualifying candidates overlap unrelated local changes and cannot be safely isolated.
- Tests reveal ambiguous current behavior.
- The implementation expands beyond two production files or changes observable behavior.
- Required verification is unavailable and no focused substitute provides confidence.

## Completion Report

Return:

1. The selected refactor and why it was the best candidate.
2. The alternatives rejected and the reason for each rejection.
3. The files changed.
4. Tests and validation run, including failures.
5. Any residual risk or verification gap.
