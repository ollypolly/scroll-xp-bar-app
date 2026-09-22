export type WebViewEvent =
  | { type: 'VIDEO_STARTED'; videoId: string; duration: number | null }
  | { type: 'VIDEO_PROGRESS'; videoId: string; position: number; duration: number | null }
  | { type: 'VIDEO_CHANGED'; previousVideoId: string | null; videoId: string; duration: number | null }
  | { type: 'VIDEO_ENDED'; videoId: string; position: number; duration: number | null }
  | { type: 'SIGN_IN_STATUS'; signedIn: boolean };

/**
 * Parses a raw postMessage payload from the WebView. Returns null for anything
 * malformed instead of throwing, since the page content is not trusted input.
 */
export function parseWebViewEvent(raw: string): WebViewEvent | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null || !('type' in data)) return null;
  const event = data as Record<string, unknown>;

  switch (event.type) {
    case 'VIDEO_STARTED':
      if (typeof event.videoId !== 'string') return null;
      return {
        type: 'VIDEO_STARTED',
        videoId: event.videoId,
        duration: typeof event.duration === 'number' ? event.duration : null,
      };
    case 'VIDEO_PROGRESS':
      if (typeof event.videoId !== 'string' || typeof event.position !== 'number') return null;
      return {
        type: 'VIDEO_PROGRESS',
        videoId: event.videoId,
        position: event.position,
        duration: typeof event.duration === 'number' ? event.duration : null,
      };
    case 'VIDEO_CHANGED':
      if (typeof event.videoId !== 'string') return null;
      return {
        type: 'VIDEO_CHANGED',
        previousVideoId: typeof event.previousVideoId === 'string' ? event.previousVideoId : null,
        videoId: event.videoId,
        duration: typeof event.duration === 'number' ? event.duration : null,
      };
    case 'VIDEO_ENDED':
      if (typeof event.videoId !== 'string' || typeof event.position !== 'number') return null;
      return {
        type: 'VIDEO_ENDED',
        videoId: event.videoId,
        position: event.position,
        duration: typeof event.duration === 'number' ? event.duration : null,
      };
    case 'SIGN_IN_STATUS':
      if (typeof event.signedIn !== 'boolean') return null;
      return { type: 'SIGN_IN_STATUS', signedIn: event.signedIn };
    default:
      return null;
  }
}
