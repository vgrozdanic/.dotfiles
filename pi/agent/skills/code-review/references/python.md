# Python review guide

## Runtime correctness

- Check mutable defaults, shared mutable class attributes, late-bound closures, and accidental iterator consumption.
- Check `is` versus value equality, truthiness that conflates `0`, empty values, and `None`, and mutation during iteration.
- Check dictionary access, unpacking, sorting, and comparison against heterogeneous or missing data.
- Check naive and aware datetimes, daylight saving transitions, decimal money, float equality, and text encoding where relevant.
- Remember annotations do not validate runtime input. Validate external data at trust boundary.

## Errors and resources

- Find bare or overly broad catches that hide cancellation, shutdown, or programming errors.
- Preserve exception cause with `raise ... from ...` where translated errors need diagnosis.
- Check `finally` and context managers for files, locks, transactions, responses, streams, and temporary files.
- Check fallback values that turn failures into false success.
- Check import-time I/O, environment reads, global clients, and mutable singletons for startup and test side effects.

## Async and concurrency

- Find blocking I/O, `time.sleep`, CPU work, and synchronous ORM/client calls inside async code.
- Check created tasks for ownership, awaited errors, cancellation, and shutdown.
- Check `gather` or task creation for unbounded concurrency and partial failure semantics.
- Ensure `CancelledError` is not swallowed. Check timeout behavior and cleanup.
- Check shared state across threads, processes, signals, and async tasks. The GIL does not make multi-step operations atomic.

## Security

- Audit `subprocess` with shell strings, `eval`/`exec`, unsafe pickle or YAML loading, archive extraction, path joins, and temporary files.
- Use parameterized database calls. Do not interpolate values into SQL.
- Validate URLs and redirects before outbound requests. Apply timeouts to network calls.
- Do not log secrets or return raw exception details.

## Compatibility and performance

- Check supported Python version before suggesting syntax or stdlib APIs.
- Check public call signatures, keyword arguments, serialized shapes, CLI behavior, and exception types.
- Find repeated I/O, list materialization of large iterables, quadratic membership checks, and unbounded caches only when scale supports concern.
- Do not require type hints, docstrings, a test framework, or coverage percentage unless repository policy requires them.

## Useful checks

Use configured tools. Common focused checks include `python -m pytest <path>`, `python -m unittest <module>`, configured type checker, and configured linter. Do not install missing tools.
