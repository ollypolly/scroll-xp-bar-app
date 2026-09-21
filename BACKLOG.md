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
