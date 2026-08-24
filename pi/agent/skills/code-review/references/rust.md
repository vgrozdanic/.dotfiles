# Rust review guide

## Safety and correctness

- Audit every `unsafe` block and unsafe function. Prove pointer validity, alignment, initialized bytes, aliasing, lifetimes, thread safety, and panic behavior. `debug_assert!` does not establish release-build safety.
- Require `// SAFETY:` rationale at operation and `# Safety` contract for public unsafe APIs.
- Check FFI ownership, ABI, nullability, lengths, callback lifetime, unwinding, and who frees memory.
- Check indexing, slicing, integer casts, overflow, UTF-8 boundaries, and architecture-dependent sizes.
- Check `unwrap`, `expect`, indexing, and panic paths against actual trust boundaries. Tests and proven invariants differ from request or file input.
- Check `Drop` and cleanup behavior during early return and panic. Avoid relying on destructor order across unrelated values.

## Ownership and API contracts

- Look for semantic bugs hidden by `clone`, such as updates applied to a copy. Do not flag cloning only because allocation exists.
- Check borrowed values that escape, self-referential assumptions, interior mutability, and lock poisoning policy.
- Check public enums, traits, feature flags, serialization, and error variants for compatibility.
- Prefer error types callers can act on in libraries. Preserve source and context. Do not require `thiserror` or `anyhow` by name.
- Check generic and trait-object bounds for `Send`, `Sync`, `'static`, object safety, and accidental API restriction.

## Async and concurrency

- Find blocking file, network, sleep, lock, and CPU work on async executor threads.
- Check locks held across `.await`, lock order, channel closure, bounded capacity, and backpressure.
- Check spawned task ownership. Detached tasks need shutdown, error observation, and lifetime policy when work matters.
- Check `select!` and timeout branches for cancellation safety, partial reads/writes, dropped messages, and lost transactions.
- Check retries for duplicate side effects and futures recreated in loops.

## Performance

- Flag allocation, cloning, collection, boxing, or dynamic dispatch only on meaningful paths.
- Check accidental quadratic iterator work, repeated hash lookups, lock contention, and unbounded buffers.
- Treat `Arc<Mutex<_>>`, `Box<dyn _>`, and `collect()` as tools, not findings by themselves.

## Useful checks

Use repository commands when present. Common focused checks are `cargo test <name>`, `cargo check --all-targets`, and `cargo clippy --all-targets`. Avoid changing lockfiles or enabling unrelated feature sets unless PR changes them.
