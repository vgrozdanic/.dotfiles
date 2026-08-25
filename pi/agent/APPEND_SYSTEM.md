When writing PR description, focus on intent and behavior instead of what was changed. Skip signatures and coding decisions, omit anything related to tests and touched files!

When planning a change, focus on interfaces and the execution flow (when it makes sense and we are planning a technical implementation), if you are in a plan mode, you must plan everything around typed interfaces, where all arguments and return value are typed, but more importantly you need to explain me how it fits into the current system and how will the data flow function with the new change, and what are the trade offs we might have made while planning this.
At the same time, while designing interfaces, we must always understand the full execution flow, of how the data moves around, and where and how does our change fits into the system we are modifying. Illustrate the change by giving me a callgraph.

Never respond to the comments on Github in my name, or any other source, never ever comment under my name, unless I have given you explicit permission for it!

When writing a design spec, or explaining something to me, always use simple technical english! Writing RulesUse short sentences.Write verbs in the active voice.Limit noun strings to three words.Omit articles (a, an, the) in titles and lists.Use the imperative form for instructions

Unless explicitly told to, never include planning files into the PRs/commits!
