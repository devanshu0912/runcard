# Building RunCard with Claude Code

Claude Code reads `CLAUDE.md` at the start of every session, so it already knows the stack,
the phase, and the rules. Your job is to give it small, clear tasks and check the result on your phone.

## Daily loop
1. Open the project in VS Code. Start the app: `npx expo start` (keep this terminal running).
2. Open a second terminal (or the Claude Code panel) and run `claude`.
3. Give one focused task (examples below). For anything bigger than a small change, ask for a plan
   first: *"Plan this before writing code: …"* and approve or adjust the plan.
4. Review the diff Claude shows you. Reload the app on your phone and actually try it.
5. Commit: `git add -A && git commit -m "…"` (or ask Claude to commit with a clear message).
6. Start a fresh session (`/clear`) when switching to an unrelated task — shorter context, better results.

## Rules that save you time
- One task per request. "Add a theme" is good; "add themes, accounts and GPS" is not.
- Always say how to verify: *"…then run npx tsc --noEmit and fix any errors."*
- If something breaks, paste the exact error text from the terminal or phone.
- When Claude learns something important about the project (a gotcha, a decision),
  ask it to add a line to CLAUDE.md so future sessions know too.
- Don't let it add dependencies silently. CLAUDE.md already says to ask first.

## Good first prompts (in order)

**1. Get oriented**
> Read CLAUDE.md and the src folder. Summarise how a run flows from input to shared image, and list
> anything that could break on low-end Android.

**2. A new card design**
> Add a fifth card theme called "Holi" with a vivid multi-colour gradient that still keeps text
> readable. Follow the existing theme shape in src/theme/cardThemes.ts. Run tsc after.

**3. A second card layout**
> Add a "Stats" layout option to RunCard where the route is hidden and pace, time and elevation
> are shown large in a vertical stack. Add a toggle on the card screen to switch layouts.

**4. Story format**
> Add a 9:16 story-size option (for Instagram/WhatsApp status) next to the current 4:5 card.
> Keep one RunCard component; pass the aspect ratio as a prop.

**5. Splits**
> Extend the GPX parser to compute per-km splits and show the fastest km on the card.
> Add a small test script I can run with node to check the parser on assets/samples/sample-run.gpx.

**6. Share-to-app import (v0.3 prep)**
> Plan how to let users share a .gpx file from another app directly into RunCard on Android.
> Don't write code yet — list the config changes and whether it needs a development build.

## When you're stuck
> I get this error when I tap Share: <paste error>. Find the cause, explain it in two sentences,
> then fix it with the smallest change.
