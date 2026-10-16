---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet.

Use `ask_user_question` for every round. Ask up to four frontier questions in one tool call. Give each question two to four concrete options. Put your recommendation first and append `(Recommended)` to its label. Use `multiSelect` when choices can be combined. Never add an `Other` option because the tool adds a custom-answer row. Do not print a manual question list when the tool is available.

If the frontier has more than four questions, ask the first four. After the user answers, recompute the whole frontier before asking the next batch. A question whose answer depends on another open question belongs to a later round.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Use `ask_user_question` for final confirmation. Do not act until the user confirms you have reached a shared understanding.
