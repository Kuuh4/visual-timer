import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_ALARM = '/visual-timer/audios/radar.mp3';

type CustomAlarm = {
    name: string;
    value: string;
};

/**
 * Where the countdown goes in the compact layout: overlaid on the dial, in the top-right corner (so
 * the unit switch takes its place on the dial), or nowhere.
 */
export type CompactTimeDisplay = 'dial' | 'corner' | 'hidden';

type SettingsState = {
    volume: number; // Notification sound volume (0 to 1)
    mute: boolean;
    selectedAlarm: string; // Selected alarm sound file URL
    customAlarm: CustomAlarm | null;
    isClockwise: boolean;
    /** When true, the compact layout is reserved for square windows that are also small. */
    compactOnlyOnSmallViewports: boolean;
    compactTimeDisplay: CompactTimeDisplay;
    setVolume: (volume: number) => void;
    setMute: (mute: boolean) => void;
    setSelectedAlarm: (alarm: string) => void;
    setCustomAlarm: (alarm: CustomAlarm) => void;
    removeCustomAlarm: () => void;
    setIsClockwise: (isClockwise: boolean) => void;
    setCompactOnlyOnSmallViewports: (compactOnlyOnSmallViewports: boolean) => void;
    setCompactTimeDisplay: (compactTimeDisplay: CompactTimeDisplay) => void;
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            volume: 1, // Default volume (max)
            mute: false,
            selectedAlarm: DEFAULT_ALARM, // Default alarm sound
            customAlarm: null,
            isClockwise: true, //Default direction
            compactOnlyOnSmallViewports: false, // Any square window gets the compact layout
            compactTimeDisplay: 'dial',
            setVolume: (volume) => set({ volume }),
            setMute: (mute) => set({ mute }),
            setSelectedAlarm: (alarm) => set({ selectedAlarm: alarm }),
            setCustomAlarm: (customAlarm) => set({ customAlarm, selectedAlarm: customAlarm.value }),
            removeCustomAlarm: () => set({ customAlarm: null, selectedAlarm: DEFAULT_ALARM }),
            setIsClockwise: (isClockwise) => set({ isClockwise }),
            setCompactOnlyOnSmallViewports: (compactOnlyOnSmallViewports) => set({ compactOnlyOnSmallViewports }),
            setCompactTimeDisplay: (compactTimeDisplay) => set({ compactTimeDisplay }),
        }),
        {
            name: 'settings-store',
            version: 5, // a migration will be triggered if the version in the storage mismatches this one
            migrate: (persistedState, version) => {
                // Each step builds on the previous one, so an old install catches up through all of them.
                let state = persistedState as SettingsState;
                if (version < 2) {
                    state = {
                        ...state,
                        selectedAlarm: DEFAULT_ALARM,
                        isClockwise: true,
                        customAlarm: null,
                    };
                }
                if (version < 3) {
                    state = { ...state, customAlarm: null };
                }
                if (version < 4) {
                    state = { ...state, compactOnlyOnSmallViewports: false, compactTimeDisplay: 'dial' };
                }
                if (version < 5) {
                    // Before the corner option existed this was a boolean.
                    const wasVisible = (persistedState as { showCompactTimeDisplay?: boolean }).showCompactTimeDisplay;
                    state = { ...state, compactTimeDisplay: wasVisible === false ? 'hidden' : 'dial' };
                }
                return state;
            },
        }
    )
);
