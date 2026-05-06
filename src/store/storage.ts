import type { TransitState } from '../types/transport';

export const STORAGE_KEY = 'interactive-transit-dispatcher-v1';

export const saveStateToStorage = (state: TransitState): void => {
  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // No-op: app should still work without persistence.
  }
};

export const loadStateFromStorage = (): TransitState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as TransitState;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const removeStoredState = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op
  }
};
