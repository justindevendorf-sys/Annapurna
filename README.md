# Annapurna

A medical food & symptom tracker built for a neurodivergent, dyslexic kid to
use on her own, with picture-first logging, read-aloud text, and voice-to-text
— plus a weekly summary emailed automatically to both parents.

This exists to get consistent, first-person symptom data (not relayed
secondhand) to support a diagnostic workup for suspected non-celiac gluten
sensitivity, slow gut motility, MCAS, and dairy intolerance. It is a logging
tool, not a diagnostic one.

## What it does

- **Log a Meal** — tap pictograph food categories (bread/wheat, dairy, fruit,
  fried food, etc.), optional voice note for anything else.
- **How I'm Feeling** — a 5-face mood scale plus symptom pictographs
  (bloating, cramps, nausea, fatigue, itching/rash, headache, reflux). Prompted
  automatically ~20–180 minutes after a logged meal, or usable any time.
- **I Pooped** — the 7 Bristol Stool Chart types as tappable picture cards.
- **Read-aloud everywhere** — a speaker button reads any screen's prompts out
  loud (Web Speech API), and every text field has a microphone button for
  voice-to-text instead of typing.
- **Accessibility settings** — high-contrast mode, adjustable text size,
  large tap targets, dyslexia-friendlier font stack.
- **Weekly email report** — every Sunday (configurable), both parents get an
  emailed summary: foods eaten by category, mood trend, symptom frequency,
  and Bristol type distribution.

## Architecture

- `public/` — the front end: a installable web app (PWA). No build step,
  plain HTML/CSS/JS. This is what loads on the iPad.
- `server/` — a small Node/Express backend: stores entries in SQLite and
  sends the weekly email.

There's no native iOS app here — it wasn't buildable from this environment
(no Xcode/Mac), and a PWA gets you on her Home Screen today without an App
Store submission.

## Getting it onto her iPad

1. Deploy `server/` somewhere it can run continuously (see below) — it also
   serves the front end, so one URL is all you need.
2. On her iPad, open that URL in **Safari**.
3. Tap the Share icon → **Add to Home Screen**. It now behaves like an
   installed app (own icon, full-screen, works offline for logging UI).

Any small always-on Node host works (Render, Fly.io, Railway free tiers, a
Raspberry Pi at home, etc.) — pick whichever gives it a stable HTTPS URL,
since Add to Home Screen and voice input both want HTTPS.

## Setting up the backend

```bash
cd server
npm install
cp .env.example .env
# edit .env — see below
npm start
```

### Weekly email — provider fallback order

Fill in `server/.env`. On each weekly send, it tries providers in this order
and falls through to the next on failure:

1. **iCloud** (`ICLOUD_EMAIL`, `ICLOUD_APP_PASSWORD`) — generate an
   app-specific password at appleid.apple.com → Sign-In and Security →
   App-Specific Passwords.
2. **Gmail** (`GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`) — requires 2-Step
   Verification, then an app password at myaccount.google.com/apppasswords.
3. **Resend free tier** (`RESEND_API_KEY`) — sign up at resend.com, no
   domain setup needed to start (100 emails/day free).

Only providers with credentials filled in are attempted, so it's fine to
configure just one.

### Recipients

```
PARENT_EMAILS=
```

Left blank on purpose — the weekly job checks this and skips (doesn't error)
until both addresses are confirmed and added here, comma-separated:

```
PARENT_EMAILS=mom@example.com,dad@example.com
```

### Schedule

```
REPORT_CRON=0 18 * * 0        # Sunday 6:00 PM
REPORT_TIMEZONE=America/New_York
```

To test the email immediately without waiting for the schedule:

```bash
npm run send-report-now
```

## Data

Everything is stored locally in `server/data/annapurna.db` (SQLite) —
nothing goes to any third-party analytics or ad service. If you deploy to a
hosting provider, that provider's disk/DB is the only place the data lives
besides the weekly email itself.

## Notes on the design

- Bristol Stool Chart entries use abstract icons + plain-language labels
  ("Type 1: Hard little lumps") rather than realistic imagery — enough detail
  to log accurately without being upsetting for a kid to look at.
- The "how are you feeling" prompt appears as a gentle banner 20–180 minutes
  after a meal is logged, rather than a push notification, to avoid nagging.
- The weekly email explicitly states it's a self-reported log meant to
  support conversations with her care team, not a diagnosis.
