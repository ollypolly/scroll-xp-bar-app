import { calculateShortXP, calculateWatchPercentage } from '../xp/xpEngine';
import type { XPConfig } from '../xp/xpConfig';
import type { WebViewEvent } from '../youtube/youtubeEvents';

export type WatchSession = {
  videoId: string;
  duration: number | null;
  /** Continuous watch time, for analytics only — not used for the XP percentage. */
  watchedSeconds: number;
  startedAt: number;
  lastActiveAt: number;
  /** Furthest playback position reached; this is what XP is calculated from. */
  maxPlaybackPosition: number;
};

export type ShortCompletionResult = {
  videoId: string;
  watchPercentage: number;
  xpAwarded: number;
  watchedSeconds: number;
  durationUnknown: boolean;
  alreadyRewarded: boolean;
};

/**
 * Owns watch-session state for the Short currently on screen and decides how much
 * XP a finished Short earns. Pure decision logic: it only reacts to WebViewEvents
 * reported by the injected YouTube script, never inspects the page itself.
 */
export class WatchSessionTracker {
  private currentSession: WatchSession | null = null;
  private readonly rewardedVideoIds: Set<string>;

  constructor(rewardedVideoIds: Iterable<string> = []) {
    this.rewardedVideoIds = new Set(rewardedVideoIds);
  }

  getCurrentSession(): WatchSession | null {
    return this.currentSession;
  }

  getRewardedVideoIds(): string[] {
    return Array.from(this.rewardedVideoIds);
  }

  /**
   * Feeds one bridge event into the tracker. Returns a ShortCompletionResult when
   * a Short has just finished (on VIDEO_CHANGED or VIDEO_ENDED), otherwise null.
   */
  handleEvent(event: WebViewEvent, config: XPConfig, now: number = Date.now()): ShortCompletionResult | null {
    switch (event.type) {
      case 'VIDEO_STARTED':
        this.startSession(event.videoId, event.duration, now);
        return null;

      case 'VIDEO_PROGRESS':
        this.updateProgress(event.videoId, event.position, event.duration, now);
        return null;

      case 'VIDEO_CHANGED': {
        const result = event.previousVideoId
          ? this.finishSession(event.previousVideoId, config)
          : null;
        this.startSession(event.videoId, event.duration, now);
        return result;
      }

      case 'VIDEO_ENDED':
        this.updateProgress(event.videoId, event.position, event.duration, now);
        return this.finishSession(event.videoId, config);

      // Handled upstream in useYouTubeShortsBridge before it ever reaches the tracker.
      case 'SIGN_IN_STATUS':
        return null;
    }
  }

  private startSession(videoId: string, duration: number | null, now: number): void {
    this.currentSession = {
      videoId,
      duration,
      watchedSeconds: 0,
      startedAt: now,
      lastActiveAt: now,
      maxPlaybackPosition: 0,
    };
  }

  private updateProgress(videoId: string, position: number, duration: number | null, now: number): void {
    if (!this.currentSession || this.currentSession.videoId !== videoId) {
      this.startSession(videoId, duration, now);
    }
    const session = this.currentSession as WatchSession;

    if (position > session.maxPlaybackPosition) {
      // Only "new ground" counts toward continuous watch time, so pausing/rewinding
      // and re-crossing the same timestamp can't inflate it.
      const elapsedSinceLastUpdate = (now - session.lastActiveAt) / 1000;
      const newGround = position - session.maxPlaybackPosition;
      session.watchedSeconds += Math.max(0, Math.min(elapsedSinceLastUpdate, newGround));
      session.maxPlaybackPosition = position;
    }
    if (duration != null) session.duration = duration;
    session.lastActiveAt = now;
  }

  private finishSession(videoId: string, config: XPConfig): ShortCompletionResult | null {
    const session = this.currentSession;
    if (!session || session.videoId !== videoId) return null;
    this.currentSession = null;

    if (this.rewardedVideoIds.has(videoId)) {
      return {
        videoId,
        watchPercentage: 0,
        xpAwarded: 0,
        watchedSeconds: session.watchedSeconds,
        durationUnknown: false,
        alreadyRewarded: true,
      };
    }

    if (session.duration == null || session.duration <= 0) {
      return {
        videoId,
        watchPercentage: 0,
        xpAwarded: 0,
        watchedSeconds: session.watchedSeconds,
        durationUnknown: true,
        alreadyRewarded: false,
      };
    }

    const watchPercentage = calculateWatchPercentage(session.maxPlaybackPosition, session.duration);
    const xpAwarded = calculateShortXP(session.maxPlaybackPosition, session.duration, config);
    if (xpAwarded > 0) this.rewardedVideoIds.add(videoId);

    return {
      videoId,
      watchPercentage,
      xpAwarded,
      watchedSeconds: session.watchedSeconds,
      durationUnknown: false,
      alreadyRewarded: false,
    };
  }
}
