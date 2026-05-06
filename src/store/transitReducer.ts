import { createMockDataset } from '../data/mockData';
import type { TransitState, TripSchedule, AppMode, Language } from '../types/transport';
import { timeToMinutes } from '../utils/time';

export type TransitAction =
  | { type: 'SELECT_LINE'; lineId: string }
  | { type: 'SELECT_DIRECTION'; directionId: string }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'TICK'; step?: number }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SAVE_TRIP'; trip: TripSchedule }
  | { type: 'DELETE_TRIP'; tripId: string }
  | { type: 'SET_VALIDATION_ERROR'; error: string | null }
  | { type: 'LOAD_SNAPSHOT'; snapshot: TransitState }
  | { type: 'RESET_MOCK' };

const getFirstLineId = (state: TransitState): string => state.dataset.lines[0]?.id ?? '';

const getDirectionForLine = (state: TransitState, lineId: string): string => {
  const line = state.dataset.lines.find((item) => item.id === lineId);
  return line?.directions[0]?.id ?? '';
};

const getDefaultClock = (state: TransitState): number => {
  const firstTrip = state.dataset.schedules[0];
  const firstDeparture = firstTrip ? timeToMinutes(firstTrip.departureTime) : 360;
  if (Number.isNaN(firstDeparture)) {
    return 360;
  }
  return Math.max(firstDeparture - 10, 0);
};

export const createDefaultState = (): TransitState => {
  const dataset = createMockDataset();
  const lineId = dataset.lines[0]?.id ?? '';
  const directionId = dataset.lines[0]?.directions[0]?.id ?? '';

  const draft: TransitState = {
    dataset,
    selectedLineId: lineId,
    selectedDirectionId: directionId,
    mode: 'planning',
    isPlaying: false,
    currentTimeMinutes: 360,
    language: 'en',
    validationError: null,
  };

  return {
    ...draft,
    currentTimeMinutes: getDefaultClock(draft),
  };
};

const normalizeMode = (mode: unknown): AppMode => (mode === 'live' ? 'live' : 'planning');
const normalizeLanguage = (language: unknown): Language => (language === 'cs' ? 'cs' : 'en');

export const normalizeSnapshot = (snapshot: TransitState | null): TransitState => {
  const fallback = createDefaultState();

  if (!snapshot?.dataset?.lines?.length || !snapshot.dataset?.trams?.length) {
    return fallback;
  }

  const mode = normalizeMode(snapshot.mode);
  const language = normalizeLanguage(snapshot.language);
  const selectedLineId = snapshot.dataset.lines.some((line) => line.id === snapshot.selectedLineId)
    ? snapshot.selectedLineId
    : fallback.selectedLineId;

  const selectedLine = snapshot.dataset.lines.find((line) => line.id === selectedLineId);
  const selectedDirectionId = selectedLine?.directions.some((direction) => direction.id === snapshot.selectedDirectionId)
    ? snapshot.selectedDirectionId
    : selectedLine?.directions[0]?.id ?? fallback.selectedDirectionId;

  return {
    ...snapshot,
    selectedLineId,
    selectedDirectionId,
    mode,
    isPlaying: mode === 'live' ? snapshot.isPlaying : false,
    language,
    validationError: null,
  };
};

export const transitReducer = (state: TransitState, action: TransitAction): TransitState => {
  switch (action.type) {
    case 'SELECT_LINE': {
      const nextLine = state.dataset.lines.find((line) => line.id === action.lineId);
      if (!nextLine) {
        return state;
      }

      return {
        ...state,
        selectedLineId: nextLine.id,
        selectedDirectionId: nextLine.directions[0]?.id ?? state.selectedDirectionId,
      };
    }

    case 'SELECT_DIRECTION': {
      const parentLine = state.dataset.lines.find((line) =>
        line.directions.some((direction) => direction.id === action.directionId),
      );

      if (!parentLine) {
        return state;
      }

      return {
        ...state,
        selectedLineId: parentLine.id,
        selectedDirectionId: action.directionId,
      };
    }

    case 'SAVE_TRIP': {
      const existingTrip = state.dataset.schedules.some((trip) => trip.id === action.trip.id);

      return {
        ...state,
        dataset: {
          ...state.dataset,
          schedules: existingTrip
            ? state.dataset.schedules.map((trip) => (trip.id === action.trip.id ? action.trip : trip))
            : [...state.dataset.schedules, action.trip],
        },
        validationError: null,
      };
    }

    case 'DELETE_TRIP': {
      return {
        ...state,
        dataset: {
          ...state.dataset,
          schedules: state.dataset.schedules.filter((trip) => trip.id !== action.tripId),
        },
        validationError: null,
      };
    }

    case 'SET_MODE': {
      return {
        ...state,
        mode: action.mode,
        isPlaying: action.mode === 'live' ? state.isPlaying : false,
      };
    }

    case 'TOGGLE_PLAY': {
      if (state.mode !== 'live') {
        return state;
      }

      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    }

    case 'TICK': {
      const step = action.step ?? 1;
      const nextClock = (state.currentTimeMinutes + step + 1440) % 1440;
      return {
        ...state,
        currentTimeMinutes: nextClock,
      };
    }

    case 'SET_LANGUAGE': {
      return {
        ...state,
        language: action.language,
      };
    }

    case 'SET_VALIDATION_ERROR': {
      return {
        ...state,
        validationError: action.error,
      };
    }

    case 'LOAD_SNAPSHOT': {
      return normalizeSnapshot(action.snapshot);
    }

    case 'RESET_MOCK': {
      const reset = createDefaultState();
      return {
        ...reset,
        language: state.language,
      };
    }

    default:
      return state;
  }
};

export const getSafeSelection = (state: TransitState): { lineId: string; directionId: string } => {
  const lineId = state.dataset.lines.some((line) => line.id === state.selectedLineId)
    ? state.selectedLineId
    : getFirstLineId(state);

  const directionId = state.dataset.lines
    .find((line) => line.id === lineId)
    ?.directions.some((direction) => direction.id === state.selectedDirectionId)
    ? state.selectedDirectionId
    : getDirectionForLine(state, lineId);

  return { lineId, directionId };
};
