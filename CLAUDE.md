# RunCard — project context for Claude Code

## What this is
A running app for India (later global). The bet: runners share a beautiful run card on
WhatsApp/Instagram, which becomes free growth. Card + community first; tracking + stats later.
Built by a solo developer. Keep everything simple enough for one person to maintain.

## Current phase: v0.1 — card generator only
In scope: manual run entry, GPX import, card rendering (Skia), themes, share as PNG.
**Out of scope right now — do not add unless explicitly asked:** backend, accounts, databases,
GPS tracking, maps SDKs, analytics SDKs, state libraries, UI kits, payments.
The goal of v0.1 is to test one question: do real runners share the card?

## Stack
- Expo (managed, latest SDK) + React Native + TypeScript (strict)
- expo-router for navigation (`app/` folder = screens)
- @shopify/react-native-skia for drawing the card
- expo-document-picker + expo-file-system (new `File`/`Paths` API) for GPX import and PNG export
- expo-sharing for the system share sheet
- Later phases: Health Connect / HealthKit sync → Supabase (Postgres + PostGIS) → background GPS
  (react-native-background-geolocation) → MapLibre. See docs/ROADMAP.md.

## Structure
```
app/               screens (expo-router): _layout.tsx, index.tsx (input), card.tsx (preview + share)
src/types/run.ts   the Run model — every import source maps to this one shape
src/lib/           pure logic: gpx.ts (parser), format.ts, route.ts (projection), share.ts, importGpx.ts
src/components/    RunCard.tsx (Skia card), Button.tsx, Field.tsx
src/state/         RunContext.tsx (current run, in memory)
src/theme/         ui.ts (app tokens), cardThemes.ts (card designs)
assets/samples/    sample-run.gpx for testing import
docs/              ROADMAP.md, CLAUDE_WORKFLOW.md
```

## Commands
- `npx expo start` — dev server; scan QR with Expo Go on Android
- `npx expo start --tunnel` — if phone and laptop aren't on the same Wi-Fi
- `npx tsc --noEmit` — typecheck (run after every change)
- `npx expo install <pkg>` — ALWAYS use this instead of `npm install` for native/Expo packages
- `npx expo-doctor` — check for version mismatches
- `eas build -p android --profile preview` — shareable APK for testers

## Conventions
- TypeScript strict, no `any` unless unavoidable (then comment why).
- Keep logic in `src/lib` pure and UI-free so it can be tested and reused.
- Relative imports. Function components + hooks only.
- Colors and spacing come from `src/theme/ui.ts`; card colors from `cardThemes.ts`. No hard-coded hex in screens.
- User-facing copy: sentence case, plain verbs, errors say what happened and how to fix it.
- Must stay smooth on low-end Android (₹8–12k phones). Avoid heavy re-renders; memoize Skia paths/fonts.
- Prefer the smallest change that works. Ask before adding any new dependency.

## Design direction
App chrome is quiet (white, deep indigo ink `#14163A`, marigold `#F5A300` for the main action).
The card is the loud thing. One hero element per card (the distance). No all-caps labels.

## Definition of done for any task
1. `npx tsc --noEmit` passes. 2. Tested in Expo Go on a real Android phone.
3. Small, focused commit with a clear message.
