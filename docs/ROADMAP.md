# Roadmap: from card generator to full running platform

Each phase adds only what it needs. Don't start a phase until the previous one's goal is met.

## v0.1 — Card generator (you are here)
Manual entry + GPX import → beautiful card → share to WhatsApp/Instagram. No backend.
**Goal:** it works smoothly on a cheap Android phone.

## v0.2 — Real-world test (the gate)
- Build a tester APK (`eas build -p android --profile preview`) and send the link to runners.
- Join 2–3 Pune run clubs / running Instagram groups. Get 30–50 people to make and share a card.
- Add 2–4 more card designs based on what people actually post.
- Watch for: unprompted sharing, and people asking "what app is this?"
**Gate:** if people share and others ask → continue. If not → fix the card/hook first.

## v0.3 — Zero-typing import
- Android: Health Connect (`react-native-health-connect`) — reads runs from Nike Run Club,
  Samsung Health, adidas Running, etc.
- iOS: HealthKit (`react-native-health`) + route query.
- Needs an Expo development build (no longer works in Expo Go): `eas build --profile development`.
- Also: register as a share target for .gpx files so users can "share to RunCard" from other apps.

## v0.4 — Accounts and a feed
- Supabase: Auth (phone OTP fits India), Postgres, Storage (or Cloudflare R2 for card images).
- Save runs, profile, follow, feed of cards, kudos.

## v0.5 — Belonging
- Clubs and one city leaderboard (start with Pune, seed it by hand).
- Weekly club challenge, auto-summary card that can be posted to a WhatsApp group.
- PostGIS for "runs near you" and city boards.

## v1.0 — Native GPS tracking
- `react-native-background-geolocation` (paid, handles Xiaomi/Oppo/Vivo battery killers).
- Drift filtering, auto-pause, anti-cheat basics for leaderboards.
- MapLibre GL for interactive maps.

## Later
- Monetisation: event/finisher cards with race organisers, brand challenges, corporate wellness;
  optional cosmetic card packs (₹99–199/year). Individual runners stay free.
- Workouts beyond running. More cities. Other countries.
