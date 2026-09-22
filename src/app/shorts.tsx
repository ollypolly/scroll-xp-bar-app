/**
 * Placeholder route - the actual Shorts UI lives in `PersistentShortsView`, rendered
 * once in the root layout and shown/hidden by pathname instead of mount/unmount, so
 * the WebView survives a trip back to the home screen. This file exists only so
 * `router.push('/shorts')` / `back()` have a real route to navigate to.
 */
export default function ShortsScreen() {
  return null;
}
