# WB Tracker (Android)

A phone-first Android app for working your Wealth Builder prospect tracker
(<https://app.iamawealthbuilder.com/team/prospect-tracker>) on the go.

## What it does today

- **Prospects tab**: opens your prospect tracker in the app, so you can view,
  update, and add prospects. You sign in once and stay signed in.
- **Tools tab**: every tool on the roadmap, grouped by area. Tools not built in
  yet show "Coming soon" and link to the full website.
- **Website tab**: the full Wealth Builder site, for anything else.
- Phone numbers and email addresses on the site open your dialer and email app.
  File uploads use the phone's file picker.
- Portrait only, sized for a standard phone, with light and dark themes.

## Roadmap

| Area        | Tool                                               |
|-------------|----------------------------------------------------|
| Prospecting | Prospect Tracker ✅                                 |
| Calendars   | Training Calendar, Personal Calendar               |
| BPM         | Check-in, Invites, Scheduling (guests & associates)|
| Events      | Check-in, Purchases, Convention tracking           |
| Trackers    | Licensing, Mission, Production                     |

To turn on a roadmap tool that already exists as a page on the site, set its
`webPath` in `app/src/main/java/com/annapurna/wbtracker/features/Features.kt`.

## Getting the app on your phone

Every push builds a debug APK on GitHub Actions (**Actions → Android build →
latest run → Artifacts → `wb-tracker-debug-apk`**). Download it on your phone,
unzip it, and open the `.apk` (allow "install unknown apps" when prompted).

To build locally you need Android Studio or the Android SDK with JDK 17:

```sh
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```

## Project layout

```
app/src/main/java/com/annapurna/wbtracker/
  MainActivity.kt         entry point
  AppConfig.kt            site address
  features/               the list of tools and where each one lives
  web/                    the in-app browser: sign-in, uploads, links
  ui/                     screens, navigation, and theme
```
