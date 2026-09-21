# Shorts XP

Wraps YouTube Shorts in a WebView and layers an XP/leveling game on top, so scrolling feels like grinding.

## How it works

- A hidden script observes the YouTube Shorts page (video changes, playback position, duration) and posts typed events back to the native side over the WebView bridge.
- A watch-session tracker uses each video's *max* playback position (not just the latest tick) to compute a watch percentage, so seeking backward can't be used to fake progress.
- XP is awarded once per video, scaled by watch percentage, with a minimum watch threshold before anything is granted.
- Levels follow a RuneScape/OSRS-style exponential curve — the first couple of levels come quickly, then the XP required ramps up steeply.
- A native overlay (not a WebView DOM overlay, which YouTube's own page can occlude or break) shows the current level and XP bar at all times, with a Minecraft-style orb animation on XP gain and a full-screen flourish on level-up, backed by haptics and sound effects.

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

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # expo lint
npm test             # jest
```

## Project layout

- `src/app/` — screens (Expo Router): the Shorts WebView, home, and a debug screen for inspecting live event/XP state
- `src/xp/` — XP calculation and level-curve logic (pure functions, unit tested)
- `src/watchSession/` — per-video watch-session tracking and abuse prevention
- `src/youtube/` — the injected observation script, event bridge, and video-detection adapter
- `src/store/` — Zustand stores for progress and debug state
- `src/components/` — the XP bar and orb/level-up animation components

## Known limitations

- The YouTube sign-in flow (account icon on the Shorts screen) goes through Google's login inside the WebView with a spoofed user agent. Google actively detects and can block embedded-webview logins, so this may stop working at any time regardless of the workaround.
- Placeholder sound effects are synthesized tones, not final assets.
- A Dynamic Island / Live Activity showing level and "rested XP" is a planned future addition, not yet implemented.
