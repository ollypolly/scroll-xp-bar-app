# Shorts XP

Wraps YouTube Shorts in a WebView and layers an XP/leveling game on top, so scrolling feels like grinding.

## How it works

- A hidden script observes the YouTube Shorts page (video changes, playback position, duration) and posts typed events back to the native side over the WebView bridge.
- A watch-session tracker uses each video's *max* playback position (not just the latest tick) to compute a watch percentage, so seeking backward can't be used to fake progress.
- XP is awarded once per video (on scroll-away or on the video looping back to the start), proportional to seconds actually watched, with a minimum watch-percentage threshold before anything is granted — a longer Short fully watched earns more than a shorter one fully watched.
- Levels follow a RuneScape-style exponential curve capped at level 99 (RuneScape's own cap) — the first couple of levels come quickly, then the XP required ramps up steeply. Hitting 99 unlocks prestiging back to level 1, up to 10 times.
- A native overlay (not a WebView DOM overlay, which YouTube's own page can occlude or break) shows the current level and XP bar at all times, with a Minecraft-style orb animation on XP gain and a full-screen flourish on level-up (with a tap-to-prestige button once eligible), backed by haptics and sound effects.

## Stack

- Expo (React Native, TypeScript) with Expo Router for navigation
- `react-native-webview` for the Shorts page, with an injected observation-only script
- Zustand + AsyncStorage for XP/level state persistence
- React Native's built-in `Animated` API for the orb-burst and level-up animations
- `expo-haptics` / `expo-audio` for feedback

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

- The YouTube sign-in flow (account icon on the home screen) goes through Google's login inside a WebView with a spoofed user agent. Google actively detects and can block embedded-webview logins, so this may stop working at any time regardless of the workaround.
- Placeholder sound effects are synthesized tones, not final assets.
- The Shorts screen's XP pill visually mimics a Dynamic Island but isn't a real one — see [BACKLOG.md](BACKLOG.md).
