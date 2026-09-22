# Backlog

Deferred ideas, not yet scheduled.

## Real iOS Dynamic Island / Live Activity

The Shorts screen currently shows an in-app pill (`IslandXPBar`) that visually mimics the
Dynamic Island — level + XP, collapses/expands — but it's just a React Native view. It
doesn't touch the actual OS-level Dynamic Island, so it disappears when the app isn't in
the foreground.

Making it real requires:

- A native widget extension using ActivityKit (Swift/SwiftUI) for the Live Activity's
  compact/minimal/expanded Dynamic Island regions. Expo Go can't run this.
- Migrating iOS testing off Expo Go onto a custom dev client — either `npx expo run:ios`
  locally (needs Xcode), or `eas build --profile development` in the cloud.
- Likely path: the `@bacons/apple-targets` config plugin to define the widget/Live
  Activity extension target from within the Expo-managed workflow (no hand-edited `ios/`
  directory), plus a small native module bridging `progressStore`'s level/XP state to
  start/update/end the Activity. Check current docs before implementing — don't assume
  API shape from training data.
- iOS 16.1+ only. No Android equivalent.

Status: deferred 2026-09-21 — holding off on the dev-client migration for now.

## App icon and launch screen

The app was rebranded to "One More" (2026-09-22: name, source-accent color system,
wood-to-gem rank tiers, onboarding flow), but `assets/icon.png` and the Android adaptive
icon layers are still the old placeholder artwork — nothing generates real image assets,
so this needs actual design input (or a design tool) rather than a code change.

Needs:

- A real app icon (`assets/icon.png`) reflecting the new brand — dark background, the
  source-accent color as the one live accent, per the design language in the README.
- Updated Android adaptive icon layers (`foregroundImage`/`backgroundImage`/`monochromeImage`
  in `app.json`).
- A launch/splash screen matching the same look, if `expo-splash-screen` gets added later.

Status: deferred 2026-09-22 — blocking on real artwork.

## Swipe-back gesture doesn't work on the Shorts screen

The Shorts screen keeps its WebView alive by never letting it be popped - the home icon
and "Start scrolling" only ever `push`/`dismissTo` (see `src/app/shorts.tsx` and the home
screen's button), so leaving and returning resumes the same session instead of reloading
YouTube. iOS's native edge-swipe-to-go-back gesture bypasses that entirely though: it
triggers React Navigation's plain pop directly, which isn't even reaching JS right now -
swiping back from Shorts does nothing, while the same gesture works fine on every other
screen in the stack (confirmed 2026-09-22 by testing on device: home → Shorts → swipe
back → nothing; Shorts → home button → swipe back → correctly returns to the live feed).

Likely cause: the full-bleed WebView's own touch handling is winning the touch-arbitration
race against the native edge-pan gesture recognizer - a known category of friction between
`react-native-webview` and native-stack navigators, not something with a documented one-line
fix.

Two possible directions, both needing on-device iteration to verify (not diagnosable
without a real device):

- Find a way to let the OS edge gesture win the race (some `react-native-webview`/gesture
  configuration), then intercept the resulting pop (e.g. `beforeRemove`) and redirect it to
  the same push-based "go home" navigation the button uses, so it doesn't destroy the WebView.
- Or explicitly set `gestureEnabled: false` for this screen so the disabled gesture is a
  deliberate choice instead of an accidental side effect, and rely on the home button as the
  only way off Shorts.

Status: deferred 2026-09-22 — home button remains the reliable way off Shorts in the meantime.
