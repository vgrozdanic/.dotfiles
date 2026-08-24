---
name: code-review
description: Review uncommitted session changes or a linked pull request for concrete bugs, regressions, security flaws, and meaningful performance risks. Use for code review, PR review, or the /review command. Supports Rust, Python, Django, React, TypeScript, and JavaScript.
license: MIT; adapted from awesome-skills/code-review-skill
---

# Code review

Find defects that changed code introduces. Prefer no finding over weak or speculative feedback.

## Boundaries

- Review only. Do not edit files.
- Never post comments, submit reviews, approve, or request changes on any remote service.
- Ignore unrelated pre-existing defects unless changed code exposes or worsens them.
- Ignore formatting, import order, naming preferences, and linter-only issues.
- Do not demand abstractions, comments, tests, or optimizations without a concrete failure mode.
- Use repository rules and intended behavior as primary evidence. Treat references as prompts, not laws.

## Select target

### Linked pull request

When user supplies a PR URL:

1. Read PR title, body, linked issue, base branch, commits, changed files, diff, and CI status.
2. Prefer read-only tools such as `gh pr view <url>`, `gh pr diff <url>`, and web fetches.
3. Do not check out PR into user's working tree. Use existing refs or a temporary directory if full source context is required.
4. Review whole PR diff against base, not only latest commit.

### Current session changes

When user supplies no PR URL:

1. Infer session paths from files created, edited, or discussed in current conversation.
2. Run `git status --short` from repository root.
3. Inspect staged and unstaged tracked changes with `git diff HEAD -- <session-paths>`.
4. Find untracked session files with `git ls-files --others --exclude-standard -- <session-paths>` and read them directly.
5. If session paths cannot be inferred reliably, review all uncommitted changes and state that scope.
6. If repository has no `HEAD`, inspect staged and unstaged diffs separately.

Do not silently include unrelated dirty files when session scope is known.

## Gather context

1. Read repository instructions and relevant PR or task intent.
2. Read complete changed functions, types, tests, configuration, and migrations.
3. Search every caller or consumer affected by changed contracts.
4. Compare new code with nearby patterns and existing helpers.
5. Check deleted behavior and compatibility, not only added lines.
6. Use diff line numbers for findings. Use file line numbers for untracked files.

## Load references

Always read [cross-cutting guide](references/cross-cutting.md). Then read only matching guides:

- `.rs`: [Rust](references/rust.md)
- `.py`: [Python](references/python.md)
- Django imports, settings, models, migrations, views, templates, or DRF: [Django](references/django.md) plus Python
- React components or hooks: [React](references/react.md) plus TypeScript/JavaScript when applicable
- `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`: [TypeScript/JavaScript](references/typescript-javascript.md)

For unsupported languages, apply cross-cutting guide only. Do not invent language rules.

## Finding gate

Report a finding only when all conditions hold:

1. Changed code causes or exposes it.
2. A realistic input, state, or execution path triggers it.
3. Impact affects correctness, security, data, availability, compatibility, or material performance.
4. Finding points to smallest useful changed line range.
5. Suggested direction is actionable and fits current design.

Trace execution to prove each finding. Drop findings based only on preference, arbitrary thresholds, or hypothetical future needs. Check assumptions against code, tests, configuration, or official docs when needed.

## Validate

Run smallest safe existing checks that can confirm or reject suspected findings. Prefer focused tests, type checks, compiler checks, or linters already configured by repository. Do not install dependencies, change tracked files, or run destructive commands. A failed check is evidence only after separating existing failures from changed-code failures.

## Severity

- **P0**: Immediate exploit, data loss, or broad outage on normal path. Block merge.
- **P1**: Likely bug, security flaw, or breaking regression. Block merge.
- **P2**: Concrete edge-case defect or limited operational risk. Non-blocking unless project policy says otherwise.

Do not report nits or praise. Order findings by severity, then file path.

## Output

Start with findings. Use this form:

```markdown
## Findings

- [P1] Short imperative title — `path/to/file.ts:42`
  Explain trigger and impact in one short paragraph. Give minimal fix direction.
```

Use one finding per independent defect. Keep line range tight. Do not combine unrelated concerns.

If no findings pass gate, write `No findings.`

Finish with:

```markdown
## Verdict
Request changes | No blocking findings | No findings

## Validation
- command — result
```

State review scope in Validation when it was inferred or limited. Do not add a general change summary unless needed to explain scope.
