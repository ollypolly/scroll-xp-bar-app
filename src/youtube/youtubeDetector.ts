import type { WebViewEvent } from './youtubeEvents';

export type VideoState = {
  videoId: string;
  duration: number | null;
  position: number;
};

/**
 * Abstraction over "what Short is currently on screen and how far into it are we".
 * The rest of the app depends only on this interface, not on how YouTube's page
 * is detected — see src/youtube/README concept in the project spec.
 */
export interface VideoProvider {
  getCurrentVideo(): VideoState | null;
  getCurrentPosition(): number | null;
  getDuration(): number | null;
  onVideoChange(callback: (state: VideoState) => void): () => void;
}

/**
 * VideoProvider implementation backed by parsed WebView bridge events.
 * Call ingestEvent() for every event received from the injected YouTube script.
 */
export class YouTubeVideoProvider implements VideoProvider {
  private current: VideoState | null = null;
  private readonly listeners = new Set<(state: VideoState) => void>();

  ingestEvent(event: WebViewEvent): void {
    switch (event.type) {
      case 'VIDEO_STARTED':
        this.current = { videoId: event.videoId, duration: event.duration, position: 0 };
        this.notify();
        break;
      case 'VIDEO_PROGRESS':
        if (this.current && this.current.videoId === event.videoId) {
          this.current = {
            videoId: event.videoId,
            duration: event.duration ?? this.current.duration,
            position: event.position,
          };
        }
        break;
      case 'VIDEO_CHANGED':
        this.current = { videoId: event.videoId, duration: event.duration, position: 0 };
        this.notify();
        break;
      case 'VIDEO_ENDED':
        if (this.current && this.current.videoId === event.videoId) {
          this.current = { ...this.current, position: event.position };
        }
        break;
    }
  }

  getCurrentVideo(): VideoState | null {
    return this.current;
  }

  getCurrentPosition(): number | null {
    return this.current?.position ?? null;
  }

  getDuration(): number | null {
    return this.current?.duration ?? null;
  }

  onVideoChange(callback: (state: VideoState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    if (this.current) {
      const snapshot = this.current;
      this.listeners.forEach((cb) => cb(snapshot));
    }
  }
}
