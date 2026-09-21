import { Platform } from 'react-native';

export const SHORTS_URL = 'https://www.youtube.com/shorts';
export const GOOGLE_SIGN_IN_URL = `https://accounts.google.com/ServiceLogin?service=youtube&continue=${encodeURIComponent(SHORTS_URL)}`;

// A plain mobile Safari/Chrome UA (no embedded-webview signature) so Google's sign-in
// page doesn't reject the request as an untrusted embedded browser.
export const WEBVIEW_USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
  default: undefined,
});
