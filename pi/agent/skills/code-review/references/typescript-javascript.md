# TypeScript and JavaScript review guide

## Runtime and types

- Remember TypeScript types disappear at runtime. Validate network, storage, environment, URL, message, and parsed JSON data.
- Check unsafe assertions, non-null assertions, `any`, unchecked indexing, and casts where runtime values can violate assumption.
- Check truthiness that conflates `0`, `false`, empty string, `NaN`, `null`, and `undefined`.
- Check object spread and defaulting semantics, especially `||` versus `??`, omitted fields, and explicit `undefined`.
- Check discriminated unions and switches for reachable missing cases. Do not demand generic abstractions without use.
- Check prototype-bearing dictionaries and attacker-controlled keys. Prefer `Map`, `Object.create(null)`, or guarded own-property access where needed.

## Async and events

- Check missing `await`, floating promises, callback APIs, and errors thrown outside surrounding `try` blocks.
- `fetch` resolves for HTTP errors. Check status handling when non-2xx must fail.
- Check request races, `AbortController`, timeout cleanup, event listener identity, timer cleanup, and stream closure.
- Choose `Promise.all`, `allSettled`, sequential work, or bounded concurrency based on failure and ordering semantics. None is universally correct.
- Check retries for duplicated writes and backoff. Check unbounded `map(async ...)`, queue growth, and fan-out.
- Check stale closures and mutation shared across event handlers or concurrent requests.

## Data and platform behavior

- Check number precision above safe integer range, currency rounding, `NaN`, negative zero, and parsing behavior.
- Check date parsing, time zones, locale, DST, and server/client differences.
- Check regular expressions for incorrect anchors, stateful global flags, and catastrophic backtracking on untrusted input.
- Check ESM/CJS boundaries, package `exports`, default interop, side effects, dynamic imports, and runtime-supported syntax.
- Check browser and Node API availability against configured targets, not latest platform assumptions.
- Check serialization for `undefined`, bigint, dates, maps, sets, cyclic values, and class instances.

## Security

- Audit DOM HTML sinks, dynamic code, shell execution, SQL strings, path construction, open redirects, and user-controlled URLs.
- Validate message origins and payloads for `postMessage` and cross-window communication.
- Check server-side authorization independently from frontend route or button visibility.
- Check secrets do not enter browser bundles, source maps, logs, or error responses.
- Apply size and rate bounds to attacker-controlled parsing, uploads, regex, decompression, and concurrency.

## React-adjacent TypeScript

- Check event types, ref nullability, component prop unions, callback variance, and server/client serializability.
- Avoid broad casts that hide incorrect third-party or DOM assumptions.
- Do not require `readonly`, `strict`, `noUncheckedIndexedAccess`, or a specific linter unless repository adopts that policy. Findings need runtime or contract impact.

## Useful checks

Read `package.json`, lockfile, runtime targets, and `tsconfig` before judging APIs. Use existing focused tests, `tsc --noEmit` or project type-check script, and configured linter. Do not install tools or rewrite lockfiles.
