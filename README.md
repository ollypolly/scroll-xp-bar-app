# One More

*just one more.*

Wraps a short-form video feed (YouTube Shorts today) in a WebView and layers an honest
XP/leveling game on top — it doesn't pretend the scroll is good for you, it just puts a
scoreboard on the loop you're already in.

## How it works

- A hidden script observes the video feed (video changes, playback position, duration) and posts typed events back to the native side over the WebView bridge.
- A watch-session tracker uses each video's *max* playback position (not just the latest tick) to compute a watch percentage, so seeking backward can't be used to fake progress.
- XP is awarded once per video (on scroll-away or on the video looping back to the start), proportional to seconds actually watched, with a minimum watch-percentage threshold before anything is granted — a longer Short fully watched earns more than a shorter one fully watched.
- Levels follow a RuneScape-style exponential curve capped at level 99 (RuneScape's own cap) — the first couple of levels come quickly, then the XP required ramps up steeply. Hitting 99 unlocks prestiging back to level 1, up to 10 times.
- Rank tiers escalate materially as you climb: plain wood at level 1, through bronze/iron/silver/gold, into genuinely animated gem tiers (emerald → sapphire → ruby → a prismatic top tier) with a looping shine sweep — see `RankSurface`.
- The one saturated color in an otherwise monochrome UI is the active source's accent (YouTube red today) — see `SOURCE_ACCENTS` in `src/theme/tokens.ts`, keyed so a future second source gets its own accent without a redesign.
- A native overlay (not a WebView DOM overlay, which the page itself can occlude or break) shows the current level and XP bar at all times, with a Minecraft-style orb animation on XP gain and a full-screen flourish on level-up (with a tap-to-prestige button once eligible), backed by haptics.

## Stack

- Expo (React Native, TypeScript) with Expo Router for navigation
- `react-native-webview` for the video feed, with an injected observation-only script
- Zustand + AsyncStorage for XP/level state persistence
- React Native's built-in `Animated` API plus `expo-linear-gradient` for the orb-burst, level-up, and gem-tier shimmer animations
- `expo-haptics` for feedback (`expo-audio`-based sound effects are wired up but currently disabled — see Known limitations)

## Running

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on a physical device. WebView-based YouTube playback and the JS↔RN bridge don't work on web, so this needs Expo Go or a native build — not `--web`.

## How to share

Every dependency in this project (WebView, AsyncStorage, haptics, audio, safe-area-context, router) is bundled in Expo Go, so no custom dev build is needed to let someone else try it out:

1. They install **Expo Go** from the App Store (iOS) or Play Store (Android).
2. You run `npx expo start --tunnel` — `--tunnel` routes through the internet instead of local wifi, so they don't need to be on your network.
3. Send them the QR code or the printed `exp://` link; they open it via Expo Go's scanner (or by tapping the link on their phone).

Your machine needs to keep the dev server running for the session. For something that survives you going offline (e.g. multi-day testing), publish a hosted build instead with `eas update`.

### Long-standing installs via TestFlight

EAS is already scaffolded (`eas.json`, project `@ollypolly/one-more`) for a persistent, no-Expo-Go install:

1. Enroll in the Apple Developer Program (developer.apple.com, $99/yr) — required for any standalone iOS distribution.
2. `npx eas-cli@latest build --platform ios --profile production` — builds a store-ready binary.
3. `npx eas-cli@latest submit --platform ios` — uploads it to App Store Connect. First run prompts for Apple credentials and to fill in `submit.production.ios.ascAppId` in `eas.json` (from the app's App Information page in App Store Connect, created automatically on first submit if it doesn't exist yet).
4. Add testers as external testers in App Store Connect's TestFlight tab (just needs their email) — they install the TestFlight app and accept the invite.

After that, most changes (this app has no custom native modules) can ship instantly with `npx eas-cli@latest update` instead of a new build/submit cycle — only native config changes need a new binary.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # expo lint
npm test             # jest
```

## Project layout

- `src/app/` — screens (Expo Router): home (`index`), the Shorts WebView (`shorts`), profile, sign-in, and two debug screens — `debug` (live event/XP state inspector) and `debug-shorts` (a simulated Shorts feed for testing XP/level-up without YouTube)
- `src/xp/` — XP calculation, level-curve, and rank/prestige logic (pure functions, unit tested)
- `src/watchSession/` — per-video watch-session tracking and abuse prevention
- `src/youtube/` — the injected observation script, event bridge, and video-detection adapter
- `src/store/` — Zustand stores for progress and debug state
- `src/components/` — the XP bar and orb/level-up animation components

## Known limitations

- The YouTube sign-in flow ("Sign in to YouTube" on the home screen) goes through Google's login inside a WebView with a spoofed user agent. Google actively detects and can block embedded-webview logins, so this may stop working at any time regardless of the workaround.
- The home screen's "Signed in to YouTube" badge comes from `window.ytcfg.get('LOGGED_IN')`, an internal and undocumented YouTube flag with no official alternative, checked only while the Shorts WebView is open. It's best-effort and can go stale between sessions (e.g. right after "Log out", which sets it optimistically before the WebView confirms), self-correcting the next time Shorts loads.
- XP-gain/level-up sound effects are disabled (`useEffectSounds` is a no-op): playing them activated the app's audio session and interrupted the WebView's video playback. Needs an audio-focus approach that doesn't compete with the video before re-enabling.
- The Shorts screen's XP pill visually mimics a Dynamic Island but isn't a real one — see [BACKLOG.md](BACKLOG.md).
