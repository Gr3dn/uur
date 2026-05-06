import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadStateFromStorage, saveStateToStorage } from './storage';
import { createDefaultState, normalizeSnapshot, transitReducer } from './transitReducer';
import type { AppMode, Language, TransitState, TripSchedule, UpdateTripResult } from '../types/transport';
import { isArrivalAfterDeparture, timeToMinutes } from '../utils/time';
import i18n from '../i18n';

interface TransitStoreActions {
  selectLine: (lineId: string) => void;
  selectDirection: (directionId: string) => void;
  saveTrip: (trip: TripSchedule) => UpdateTripResult;
  deleteTrip: (tripId: string) => void;
  setMode: (mode: AppMode) => void;
  togglePlay: () => void;
  setLanguage: (language: Language) => void;
  saveSnapshot: () => void;
  loadSnapshot: () => boolean;
  resetMock: () => void;
}

interface TransitStoreContextValue {
  state: TransitState;
  actions: TransitStoreActions;
}

const TransitStoreContext = createContext<TransitStoreContextValue | undefined>(undefined);

const buildInitialState = (): TransitState => {
  const stored = loadStateFromStorage();
  if (!stored) {
    return createDefaultState();
  }

  return normalizeSnapshot(stored);
};

export const TransitStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(transitReducer, undefined, buildInitialState);

  // Observer-like reactive loop for Live mode: one UI event updates state, all widgets react instantly.
  useEffect(() => {
    if (state.mode !== 'live' || !state.isPlaying) {
      return;
    }

    const timerId = window.setInterval(() => {
      dispatch({ type: 'TICK', step: 1 });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [state.mode, state.isPlaying]);

  useEffect(() => {
    void i18n.changeLanguage(state.language);
  }, [state.language]);

  const selectLine = useCallback((lineId: string) => {
    dispatch({ type: 'SELECT_LINE', lineId });
  }, []);

  const selectDirection = useCallback((directionId: string) => {
    dispatch({ type: 'SELECT_DIRECTION', directionId });
  }, []);

  const saveTrip = useCallback((trip: TripSchedule): UpdateTripResult => {
    if (Number.isNaN(timeToMinutes(trip.departureTime)) || Number.isNaN(timeToMinutes(trip.arrivalTime))) {
      dispatch({ type: 'SET_VALIDATION_ERROR', error: 'validation.invalidTime' });
      return {
        ok: false,
        errorKey: 'validation.invalidTime',
      };
    }

    if (!isArrivalAfterDeparture(trip.departureTime, trip.arrivalTime)) {
      dispatch({ type: 'SET_VALIDATION_ERROR', error: 'validation.arrivalAfterDeparture' });
      return {
        ok: false,
        errorKey: 'validation.arrivalAfterDeparture',
      };
    }

    const selectedLine = state.dataset.lines.find((line) => line.id === trip.lineId);
    if (!selectedLine?.directions.some((direction) => direction.id === trip.directionId)) {
      dispatch({ type: 'SET_VALIDATION_ERROR', error: 'validation.invalidDirection' });
      return {
        ok: false,
        errorKey: 'validation.invalidDirection',
      };
    }

    if (!state.dataset.trams.some((tram) => tram.id === trip.tramId && tram.lineId === trip.lineId)) {
      dispatch({ type: 'SET_VALIDATION_ERROR', error: 'validation.invalidTram' });
      return {
        ok: false,
        errorKey: 'validation.invalidTram',
      };
    }

    dispatch({ type: 'SAVE_TRIP', trip });
    return { ok: true };
  }, [state.dataset.lines, state.dataset.trams]);

  const deleteTrip = useCallback((tripId: string) => {
    dispatch({ type: 'DELETE_TRIP', tripId });
  }, []);

  const setMode = useCallback((mode: AppMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, []);

  const setLanguage = useCallback((language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', language });
  }, []);

  const saveSnapshot = useCallback(() => {
    saveStateToStorage(state);
  }, [state]);

  const loadSnapshot = useCallback((): boolean => {
    const stored = loadStateFromStorage();
    if (!stored) {
      return false;
    }

    dispatch({ type: 'LOAD_SNAPSHOT', snapshot: stored });
    return true;
  }, []);

  const resetMock = useCallback(() => {
    dispatch({ type: 'RESET_MOCK' });
  }, []);

  const contextValue = useMemo<TransitStoreContextValue>(
    () => ({
      state,
      actions: {
        selectLine,
        selectDirection,
        saveTrip,
        deleteTrip,
        setMode,
        togglePlay,
        setLanguage,
        saveSnapshot,
        loadSnapshot,
        resetMock,
      },
    }),
    [state, selectLine, selectDirection, saveTrip, deleteTrip, setMode, togglePlay, setLanguage, saveSnapshot, loadSnapshot, resetMock],
  );

  return <TransitStoreContext.Provider value={contextValue}>{children}</TransitStoreContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTransitStore = (): TransitStoreContextValue => {
  const context = useContext(TransitStoreContext);
  if (!context) {
    throw new Error('useTransitStore must be used within TransitStoreProvider');
  }

  return context;
};
