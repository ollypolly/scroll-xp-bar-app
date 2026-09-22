import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type DebugLogEntry = {
  id: number;
  timestamp: number;
  message: string;
};

const SETTINGS_STORAGE_KEY = '@shorts-xp/debug-settings';

type DebugSettings = {
  xpOnScroll: boolean;
  levelUpOnScroll: boolean;
};

const DEFAULT_DEBUG_SETTINGS: DebugSettings = {
  xpOnScroll: false,
  levelUpOnScroll: false,
};

type DebugState = DebugSettings & {
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
  /** Loads persisted debug settings (XP-on-scroll etc.) so they carry over between app
   * launches and are shared between the real Shorts screen and the simulator. */
  loadDebugSettings: () => Promise<void>;
  setXpOnScroll: (value: boolean) => void;
  setLevelUpOnScroll: (value: boolean) => void;
  /** Set right before pushing into `/onboarding` from this screen, so onboarding knows
   * to just exit back here on finish instead of continuing into `/shorts`. Never
   * persisted - a replay is always a fresh, in-session choice. */
  isReplayingOnboarding: boolean;
  setReplayingOnboarding: (value: boolean) => void;
};

const MAX_LOG_ENTRIES = 200;
let nextLogId = 1;

function saveDebugSettings(settings: DebugSettings): void {
  void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export const useDebugStore = create<DebugState>((set, get) => ({
  ...DEFAULT_DEBUG_SETTINGS,
  currentVideoId: null,
  duration: null,
  position: null,
  watchPercentage: null,
  lastXPAward: null,
  videoChangeCount: 0,
  eventsReceivedCount: 0,
  log: [],
  isReplayingOnboarding: false,

  logEvent: (message) =>
    set((state) => ({
      log: [{ id: nextLogId++, timestamp: Date.now(), message }, ...state.log].slice(0, MAX_LOG_ENTRIES),
    })),

  updateVideoState: ({ videoId, duration, position, watchPercentage }) =>
    set({ currentVideoId: videoId, duration, position, watchPercentage }),

  recordVideoChange: () => set((state) => ({ videoChangeCount: state.videoChangeCount + 1 })),
  recordEventReceived: () => set((state) => ({ eventsReceivedCount: state.eventsReceivedCount + 1 })),
  recordXPAward: (xp) => set({ lastXPAward: xp }),

  loadDebugSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) set({ ...DEFAULT_DEBUG_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // Keep defaults if storage is unavailable/corrupted.
    }
  },

  setXpOnScroll: (value) => {
    set({ xpOnScroll: value });
    saveDebugSettings({ xpOnScroll: value, levelUpOnScroll: get().levelUpOnScroll });
  },

  setLevelUpOnScroll: (value) => {
    set({ levelUpOnScroll: value });
    saveDebugSettings({ xpOnScroll: get().xpOnScroll, levelUpOnScroll: value });
  },

  setReplayingOnboarding: (value) => set({ isReplayingOnboarding: value }),
}));
