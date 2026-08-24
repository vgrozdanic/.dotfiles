# React review guide

Read TypeScript/JavaScript guide for `.jsx` and `.tsx` too.

## Rendering and state

- Enforce Hook call order. Check conditional calls, early returns before hooks, loops, callbacks, and non-hook functions.
- Check state updates for stale closures, direct mutation, lost concurrent updates, and updates after ownership changed.
- Avoid stored state that duplicates props or other state when it can become stale. Do not require memoization for cheap derivation.
- Check list keys for identity when items insert, remove, reorder, or preserve local state.
- Check controlled and uncontrolled form transitions, default values, reset behavior, duplicate submits, and pending states.
- Check context/provider placement for cross-user or cross-request state leaks in SSR.

## Effects and async work

- Check effect dependencies against values read by setup and cleanup. Do not silence dependency rules without proving stability.
- Check timers, listeners, observers, sockets, subscriptions, and external widgets for symmetric cleanup.
- Check request races, abort behavior, stale responses, and errors. A boolean ignore flag may prevent state updates but does not stop external work.
- Flag effects used for event-specific actions or state synchronization when they cause duplicate or stale behavior. Do not flag effects merely by category.
- Check Strict Mode replay and remount behavior for non-idempotent effects.

## Server and client boundaries

- In React server frameworks, check server components for client-only APIs and client components for server-only secrets or modules.
- Check serializable props across server/client boundary.
- Check hydration for browser-only values, random IDs, dates, locale output, invalid HTML nesting, and data mismatch.
- Check server actions and handlers for server-side validation and authorization. Client validation is not security.

## Security and accessibility

- Audit `dangerouslySetInnerHTML`, URL schemes, style or attribute injection, and third-party HTML renderers.
- Check links opened in new contexts and user-controlled navigation targets.
- Preserve accessible names, labels, keyboard behavior, focus handling, semantic controls, and live status for changed interactions.
- Check loading, empty, error, and retry states when changed code can reach them.

## Performance

- Report render or bundle issues only when changed code affects a meaningful hot path or large input.
- Check expensive render work, accidental request waterfalls, broad context updates, unbounded DOM lists, and leaked subscriptions.
- Do not flag inline functions, inline objects, missing `useMemo`, missing `useCallback`, or component size by themselves.
- Verify memo dependencies and equality when memoization is added; stale memoized values are correctness bugs.

## React data libraries

- Check query keys include every input that changes result.
- Check cache scope, stale data behavior, mutation invalidation, optimistic rollback, duplicate requests, and error boundaries against installed library version.
- Do not assume React or TanStack Query latest APIs. Read package versions first.

## Useful checks

Use repository test and type-check commands. Prefer behavior tests with accessible queries. Treat snapshot churn and implementation-detail tests as risk only when they hide a concrete regression.
