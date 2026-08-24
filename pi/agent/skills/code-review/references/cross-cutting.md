# Cross-cutting review guide

Use changed behavior and repository contracts as evidence. Do not turn checklist items into findings without a trigger and impact.

## Correctness

- Trace inputs through state changes and outputs.
- Check empty, missing, duplicate, boundary, malformed, and out-of-order inputs when reachable.
- Check state machines for missing transitions, invalid retries, and partial completion.
- Check error paths for swallowed errors, wrong fallback values, duplicate side effects, and lost cleanup.
- Check multi-step writes for atomicity. Protect durable invariants with transactions or storage constraints when races matter.
- Check retries and repeated requests for idempotency when operations create, charge, send, or mutate.
- Check time zones, daylight saving, precision, overflow, rounding, encoding, and locale where domain uses them.
- Check resource lifetime for files, sockets, database handles, tasks, timers, subscriptions, and locks.
- Check concurrency for check-then-act races, stale writes, deadlocks, cancellation loss, and unbounded work.

## Contracts and compatibility

- Follow changed function, API, event, schema, config, and serialization contracts into every caller and consumer.
- Check defaults and omitted fields, not only explicit values.
- Check migrations against both old and new application versions when rolling deploys are possible.
- Check renamed or removed behavior against public exports, persisted data, caches, queues, URLs, and environment settings.
- Reject speculative compatibility concerns. Identify actual consumer or deployment path.

## Security

Review trust boundaries first.

- Authenticate identity, then authorize action and object scope on server.
- Validate untrusted structure, size, range, scheme, host, path, and content before use.
- Use parameter APIs for SQL and process arguments. Audit raw SQL, shell execution, templates, and dynamic code.
- Audit HTML escape hatches such as React `dangerouslySetInnerHTML` and Django `mark_safe`.
- Protect cookie-authenticated state changes from CSRF. Do not confuse CORS with CSRF protection.
- Check SSRF defenses across DNS resolution, redirects, private networks, alternate IP forms, and URL credentials.
- Prevent path traversal and unsafe upload names. Do not trust file extension or client MIME alone.
- Do not expose secrets, tokens, personal data, SQL, or stack traces in logs and responses.
- Use standard cryptography and secure randomness. Never invent crypto.
- Check rate or size limits only where attacker-controlled work can exhaust resources.

## Performance and operations

Report performance only when input scale or hot path makes impact material.

- Find N+1 I/O, queries in loops, repeated parsing, and avoidable network waterfalls.
- Find unbounded reads, result sets, queues, caches, retries, task creation, and concurrency.
- Check blocking work inside async runtimes and long work on UI thread.
- Check leaks from listeners, timers, subscriptions, tasks, connections, and retained closures.
- Check algorithm complexity against realistic maximum input, not arbitrary line or item counts.
- Check observability for silent failure, misleading success, secret leakage, and retry storms.

## Design and quality

- Search for existing code before accepting duplicate helpers.
- Prefer current repository boundaries. Flag a boundary violation only when it creates coupling, bypasses policy, or breaks a real contract.
- Flag abstraction only when changed code adds indirection with no current use or duplicates existing behavior.
- Flag duplication only when copies can drift and changed behavior already depends on consistency.
- Do not enforce SOLID, DRY, file sizes, parameter counts, design patterns, or coverage percentages as rules.

## Tests

Treat missing coverage as supporting evidence, not an automatic defect. Ask whether tests would have caught a concrete regression in changed behavior. Favor focused behavior, authorization, migration, race, and error-path checks.
