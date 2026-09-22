# Backlog

Deferred ideas, not yet scheduled.

## Rename the GitHub repo to match the app

Still `ollypolly/scroll-xp-bar-app` from before the "One More" rebrand. `app.json` already
uses the new identity everywhere else (slug `one-more`, bundle id `com.ollypolly.onemore`),
so the repo name is the one remaining leftover.

Needs: `gh repo rename one-more` (or via GitHub's UI), then `git remote set-url origin
<new-url>` locally so this clone keeps pushing/pulling correctly. GitHub redirects the old
URL for a while, so this is low-risk, just not done yet.

Status: deferred 2026-09-22 — can wait.

## Next up: TestFlight build to get in a mate's hands

App icon and launch screen are done (2026-09-22): a glowing accent-colored orb on the
dark brand background - the same "one saturated color" motif as the in-app Logo's
accent-colored period and the XP orb pickup effect, generated locally with Pillow rather
than waiting on external artwork. Covers `assets/icon.png`, the Android adaptive icon
layers (`foregroundImage`/`backgroundImage`/`monochromeImage`), the favicon, and
`expo-splash-screen` (newly installed and configured in `app.json`). `expo-doctor`
21/21, typecheck/lint/tests all clean.

Needs, to actually get a build to a friend:

- **An active Apple Developer Program membership (£99/year)** - required for any App
  Store Connect / TestFlight distribution, separate from a free Apple ID. Only the user
  can pay for and sign into this; check whether it's already active before assuming it
  needs (re-)purchasing.
- An EAS build profile suited for TestFlight-only sharing (internal distribution or a
  `preview`/`production` profile - check `eas.json`, since a prior session scaffolded an
  EAS project already per the "Scaffold EAS project and TestFlight build pipeline" commit).
- `eas build --platform ios` (needs an Apple Developer account signed in to EAS - only
  the user can authenticate this).
- `eas submit` to push the build to App Store Connect, or manual upload.
- Adding the friend as an external (or internal, if on the same Apple dev team) TestFlight
  tester in App Store Connect - this step is entirely in Apple's UI, not automatable here.

Status: in progress 2026-09-22 — `eas.json`'s `production` build profile (no `distribution`
set, defaults to `store`) and `submit.production` (empty, prompts interactively) are already
correctly configured for a TestFlight-bound build - confirmed against current EAS docs, no
changes needed. Apple's "no team associated" auth error (a provisioning propagation lag,
matching github.com/expo/eas-cli/issues/2072) has since resolved itself - Apple's team now
shows up correctly and builds get past auth, cert/profile creation.

Hit a second, unrelated blocker: `eas build` was failing fast at "Install dependencies" with
an `npm ci` ERESOLVE conflict - `expo` and `@expo/router-server` both declare an unpinned
peerOptional `react-dom`, which npm's resolver floated to `19.3.0` (needs `react@^19.3.0`)
against this project's pinned `react@19.2.3`. Fixed by pinning `react-dom@19.2.3` in
`devDependencies` (it's not actually used at runtime - no `react-native-web` - only pulled in
by Expo's own tooling). Verified with a clean `npm ci`, typecheck, lint, tests, and
`expo-doctor`; committed and pushed.

Next: retry `eas build --platform ios --profile production`.

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

Status: deferred 2026-09-22 — can wait, home button remains the reliable way off Shorts.

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

Status: deferred 2026-09-21 — can wait, holding off on the dev-client migration.
