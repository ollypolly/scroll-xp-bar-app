import { create } from 'zustand';

export type DebugLogEntry = {
  id: number;
  timestamp: number;
  message: string;
};

type DebugState = {
  currentVideoId: string | null;
  duration: number | null;
  position: number | null;
  watchPercentage: number | null;
  lastXPAward: number | null;
  videoChangeCount: number;
  eventsReceivedCount: number;
  log: DebugLogEntry[];
  logEvent: (message: string) => void;
  updateVideoState: (state: { videoId: string | null; duration: number | null; position: number | null; watchPercentage: number | null }) => void;
  recordVideoChange: () => void;
  recordEventReceived: () => void;
  recordXPAward: (xp: number) => void;
};

const MAX_LOG_ENTRIES = 200;
let nextLogId = 1;

export const useDebugStore = create<DebugState>((set) => ({
  currentVideoId: null,
  duration: null,
  position: null,
  watchPercentage: null,
  lastXPAward: null,
  videoChangeCount: 0,
  eventsReceivedCount: 0,
  log: [],

  logEvent: (message) =>
    set((state) => ({
      log: [{ id: nextLogId++, timestamp: Date.now(), message }, ...state.log].slice(0, MAX_LOG_ENTRIES),
    })),

  updateVideoState: ({ videoId, duration, position, watchPercentage }) =>
    set({ currentVideoId: videoId, duration, position, watchPercentage }),

  recordVideoChange: () => set((state) => ({ videoChangeCount: state.videoChangeCount + 1 })),
  recordEventReceived: () => set((state) => ({ eventsReceivedCount: state.eventsReceivedCount + 1 })),
  recordXPAward: (xp) => set({ lastXPAward: xp }),
}));
