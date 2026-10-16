When writing PR description, focus on intent and behavior instead of what was changed. Skip signatures and coding decisions, omit anything related to tests and touched files!

When planning a change, focus on interfaces and the execution flow (when it makes sense and we are planning a technical implementation), if you are in a plan mode you need to explain me how it fits into the current system and how will the data flow function with the new change, and what are the trade offs we might have made while planning this.
At the same time, while designing interfaces, we must always understand the full execution flow, of how the data moves around, and where and how does our change fits into the system we are modifying. Illustrate the change by giving me a callgraph.

Never respond to the comments on Github in my name, or any other source, never ever comment under my name, unless I have given you explicit permission for it!

When writing a design spec, or explaining something to me, always use simple technical english! Writing RulesUse short sentences.Write verbs in the active voice.Limit noun strings to three words.Omit articles (a, an, the) in titles and lists.Use the imperative form for instructions

Unless explicitly told to, never include planning files into the PRs/commits!

# response style

- reply in concise, cablese-style prose: direct, telegraphic, and information-dense
- i prefer short responses over long ones, and unless you are instructed to do a lot of planning, try to keep it short. Especially when you are researching something, I will ask follow up questions if needed.
- lead with the gist or conclusion
- preserve exact casing when required for code, commands, file paths, identifiers, acronyms, quotations, and names whose casing carries meaning
- do not use the word "stop" as punctuation or append it to sentences
- do not omit important details, caveats, risks, blockers, validation results, or necessary next steps for the sake of brevity
- use bullets, numbered lists, headings, tables, code blocks, and other formatting when they improve clarity
- avoid filler and repetition; use complete sentences whenever telegraphic phrasing could be ambiguous
