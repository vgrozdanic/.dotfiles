---
name: brainstorming
description: Use this before creative or ambiguous work—new features, behavior changes, system design, UX flows, APIs, refactors, or anything that benefits from exploring intent and options before implementation.
---

# Brainstorming Ideas Into Designs

Help turn rough ideas into clear, scoped, implementation-ready designs through collaborative dialogue.

Start by understanding the current project context. Then ask clarifying questions one at a time, explore alternatives, recommend an approach, and present a design for approval before implementation starts.

<HARD-GATE>
Do NOT implement, edit code, scaffold files, or make behavior changes until you have:
1. explored the relevant context,
2. presented a design, and
3. received user approval.
</HARD-GATE>

## When To Use This Skill

Use this skill for:
- new features
- significant refactors
- API or schema changes
- UI/UX flows
- architecture decisions
- anything underspecified or ambiguous
- any request where "just start coding" would hide assumptions

For tiny changes, the design can be brief—but it must still exist.

## Core Principles

- **Context first** — inspect the codebase, docs, and surrounding patterns before proposing changes
- **One question at a time** — keep the conversation easy to answer
- **Prefer multiple choice** — when practical, make decisions easier for the user
- **Always compare options** — propose 2–3 approaches with trade-offs
- **Recommend clearly** — don’t just list options; say which one you’d choose and why
- **Get approval before building** — design precedes implementation
- **Keep scope tight** — avoid overbuilding and decompose oversized ideas

## Required Process

Complete these steps in order:

1. **Explore context**
   - read relevant files/docs
   - identify existing patterns, constraints, and adjacent systems
   - if needed, inspect recent changes for precedent

2. **Check scope**
   - if the request is really multiple projects, say so immediately
   - help break it into smaller sub-projects
   - continue brainstorming only the first well-scoped piece

3. **Ask clarifying questions**
   - ask one question per message
   - focus on purpose, constraints, success criteria, and non-goals
   - prefer multiple-choice questions when possible

4. **Propose approaches**
   - present 2–3 viable approaches
   - include trade-offs, complexity, and risks
   - recommend one approach with reasoning

5. **Present the design**
   - scale detail to complexity
   - cover at least: architecture, main components, data flow, edge cases, and testing/validation
   - pause for approval and revise if needed

6. **Write the design down**
   - save the approved design to a project-appropriate spec file
   - default path: `docs/specs/YYYY-MM-DD-<topic>-design.md` unless the project prefers another location

7. **Self-review the spec**
   - remove placeholders/TODOs
   - resolve ambiguity
   - verify consistency across sections
   - ensure the scope is small enough to implement safely

8. **Ask for final spec review**
   - ask the user to review the written spec before implementation begins

9. **Transition to planning or implementation**
   - once the spec is approved, move into explicit planning or implementation as appropriate

## Suggested Conversation Flow

### 1) Understand the request

Before asking detailed questions, ground yourself in the codebase and restate the problem briefly in your own words.

If the project appears too broad, say so early:
- identify the separate concerns
- suggest a decomposition
- pick the first slice to design

### 2) Clarify incrementally

Ask one question at a time.

Good question areas:
- What problem are we solving?
- Who is this for?
- What should success look like?
- What constraints matter most: speed, simplicity, compatibility, maintainability?
- What should remain unchanged?
- Are there existing patterns we must follow?

### 3) Explore alternatives

Always present alternatives before locking the design.

For each approach, include:
- what it is
- why it could work
- downsides/trade-offs
- when you would choose it

Then make a recommendation.

### 4) Present the design

Keep the design structured and easy to validate. Typical sections:
- **Goal**
- **Non-goals**
- **Architecture / approach**
- **Components and responsibilities**
- **Data flow / control flow**
- **Interfaces / API changes**
- **Failure modes / edge cases**
- **Migration / rollout considerations**
- **Testing / validation**

For simpler work, these sections can be very short.

### 5) Write the spec

Once approved, write the design to a spec file. Make it concise but complete enough that implementation can proceed without re-deciding core behavior.

## Anti-Patterns To Avoid

Do not:
- jump into code before understanding intent
- ask many questions in one message
- offer only one solution when alternatives exist
- design giant systems when the request should be decomposed
- include unrelated refactors
- leave key behavior as “TBD” when you can decide it now

## Spec Self-Review Checklist

Before handing off the spec, verify:

1. **No placeholders** — no TODO/TBD/unclear sections
2. **Internal consistency** — sections don’t contradict each other
3. **Clear boundaries** — each component has one job and a clear interface
4. **Scoped correctly** — feasible as a single implementation effort
5. **Testable** — success can be validated concretely

## Completion Gate

This skill is complete only when:
- the design has been presented,
- the user has approved it,
- the spec has been written and self-reviewed, and
- the user has had a chance to review the written spec.

Only then should implementation or detailed planning begin.
