import { DEFAULT_XP_CONFIG } from '../../xp/xpConfig';
import { WatchSessionTracker } from '../watchSessionManager';

const config = DEFAULT_XP_CONFIG; // minimumWatchPercentage: 20, maxXPPerShort: 100

describe('WatchSessionTracker', () => {
  it('awards no XP for the very first VIDEO_STARTED (nothing to finish yet)', () => {
    const tracker = new WatchSessionTracker();
    const result = tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    expect(result).toBeNull();
  });

  it('calculates XP from the previous Short when the video changes', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 30, duration: 60 }, config);

    const result = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'b', duration: 60 },
      config,
    );

    expect(result).toMatchObject({ videoId: 'a', watchPercentage: 50, xpAwarded: 50 });
  });

  it('awards 0 XP when below the minimum watch percentage', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 9, duration: 60 }, config);

    const result = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'b', duration: 60 },
      config,
    );

    expect(result).toMatchObject({ videoId: 'a', xpAwarded: 0 });
  });

  it('awards full XP for a fully watched Short reported via VIDEO_ENDED', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    const result = tracker.handleEvent({ type: 'VIDEO_ENDED', videoId: 'a', position: 60, duration: 60 }, config);

    expect(result).toMatchObject({ videoId: 'a', watchPercentage: 100, xpAwarded: 100 });
  });

  it('uses max playback position, not elapsed time, so pause/resume cannot inflate XP', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config, 0);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 20, duration: 60 }, config, 1000);
    // rewind and re-cross the same ground - should not add extra watched time
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 10, duration: 60 }, config, 2000);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 35, duration: 60 }, config, 3000);

    const result = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'b', duration: 60 },
      config,
      4000,
    );

    expect(result).toMatchObject({ videoId: 'a', watchPercentage: (35 / 60) * 100 });
  });

  it('does not award XP twice for the same video (replay / back-and-forth navigation)', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 60, duration: 60 }, config);
    const first = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'b', duration: 60 },
      config,
    );
    expect(first?.xpAwarded).toBe(100);

    // navigate back to "a" and finish it again
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'b', position: 60, duration: 60 }, config);
    const backToA = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'b', videoId: 'a', duration: 60 },
      config,
    );
    expect(backToA?.xpAwarded).toBe(100); // "b" finishing for the first time

    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 60, duration: 60 }, config);
    const secondTimeOnA = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'c', duration: 60 },
      config,
    );

    expect(secondTimeOnA).toMatchObject({ videoId: 'a', xpAwarded: 0, alreadyRewarded: true });
  });

  it('restores previously rewarded video ids passed to the constructor', () => {
    const tracker = new WatchSessionTracker(['a']);
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 60, duration: 60 }, config);
    const result = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'b', duration: 60 },
      config,
    );

    expect(result).toMatchObject({ xpAwarded: 0, alreadyRewarded: true });
  });

  it('skips XP and flags durationUnknown when duration was never determined', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: null }, config);
    tracker.handleEvent({ type: 'VIDEO_PROGRESS', videoId: 'a', position: 30, duration: null }, config);

    const result = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'a', videoId: 'b', duration: 60 },
      config,
    );

    expect(result).toMatchObject({ videoId: 'a', xpAwarded: 0, durationUnknown: true });
  });

  it('ignores a VIDEO_CHANGED whose previousVideoId does not match the tracked session', () => {
    const tracker = new WatchSessionTracker();
    tracker.handleEvent({ type: 'VIDEO_STARTED', videoId: 'a', duration: 60 }, config);
    const result = tracker.handleEvent(
      { type: 'VIDEO_CHANGED', previousVideoId: 'stale-id', videoId: 'b', duration: 60 },
      config,
    );
    expect(result).toBeNull();
  });
});
