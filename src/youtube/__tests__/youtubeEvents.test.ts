import { parseWebViewEvent } from '../youtubeEvents';

describe('parseWebViewEvent', () => {
  it('parses a VIDEO_STARTED event', () => {
    const event = parseWebViewEvent(JSON.stringify({ type: 'VIDEO_STARTED', videoId: 'abc123', duration: 42.3 }));
    expect(event).toEqual({ type: 'VIDEO_STARTED', videoId: 'abc123', duration: 42.3 });
  });

  it('parses a VIDEO_CHANGED event with a null previousVideoId', () => {
    const event = parseWebViewEvent(
      JSON.stringify({ type: 'VIDEO_CHANGED', previousVideoId: null, videoId: 'xyz456', duration: 30 }),
    );
    expect(event).toEqual({ type: 'VIDEO_CHANGED', previousVideoId: null, videoId: 'xyz456', duration: 30 });
  });

  it('defaults duration to null when missing or non-numeric', () => {
    const event = parseWebViewEvent(JSON.stringify({ type: 'VIDEO_PROGRESS', videoId: 'abc123', position: 5 }));
    expect(event).toEqual({ type: 'VIDEO_PROGRESS', videoId: 'abc123', position: 5, duration: null });
  });

  it('returns null for invalid JSON', () => {
    expect(parseWebViewEvent('not json')).toBeNull();
  });

  it('returns null for an unknown event type', () => {
    expect(parseWebViewEvent(JSON.stringify({ type: 'SOMETHING_ELSE' }))).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    expect(parseWebViewEvent(JSON.stringify({ type: 'VIDEO_STARTED' }))).toBeNull();
    expect(parseWebViewEvent(JSON.stringify({ type: 'VIDEO_PROGRESS', videoId: 'abc' }))).toBeNull();
  });
});
