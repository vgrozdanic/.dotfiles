---
name: brainstorming
description: Use for unclear or open-ended features, behavior changes, system design, UX flows, APIs, or refactors. Skip design ceremony when user already provides or approves a concrete design.
---

# Brainstorming

Turn unclear requests into small, approved designs.

## Fast path

Implement immediately when user has already stated desired behavior or approved proposed design.

- Treat clear approval such as “let's do it” as final approval.
- Do not ask for approval twice.
- Do not write a spec unless user explicitly asks for one.
- Do not ask questions that do not change implementation.

## Explore unclear work

1. Read relevant code, docs, and local patterns.
2. Ask one concrete question when a decision blocks implementation.
3. Offer two or three options only when real trade-offs exist.
4. Recommend smallest option that meets request.
5. Present concise design and ask for approval.
6. Implement once user approves.

## Design format

Keep design short. State goal, flow, boundaries, and validation. Include typed interfaces and a callgraph only when task needs them.

## Rules

- Reuse existing patterns.
- Keep scope tight.
- Do not add features for future use.
- Do not create documentation, plans, or specs without an explicit request.
- Resolve ambiguity before changing behavior. Do not manufacture ambiguity.
