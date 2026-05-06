import type { Direction, Line, TransitState, Tram, TramStatus, TripSchedule } from '../types/transport';
import { getEffectiveTripWindow } from '../utils/time';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const getSelectedLine = (state: TransitState): Line | undefined =>
  state.dataset.lines.find((line) => line.id === state.selectedLineId);

export const getSelectedDirection = (state: TransitState): Direction | undefined =>
  getSelectedLine(state)?.directions.find((direction) => direction.id === state.selectedDirectionId);

export const getVisibleSchedules = (state: TransitState): TripSchedule[] =>
  state.dataset.schedules
    .filter((schedule) => schedule.lineId === state.selectedLineId && schedule.directionId === state.selectedDirectionId)
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));

export const getTramById = (state: TransitState, tramId: string): Tram | undefined =>
  state.dataset.trams.find((tram) => tram.id === tramId);

export const getStatusTone = (status: TramStatus): 'success' | 'warning' | 'default' | 'error' => {
  switch (status) {
    case 'onTime':
      return 'success';
    case 'delayed':
      return 'warning';
    case 'cancelled':
      return 'default';
    case 'accident':
      return 'error';
    default:
      return 'default';
  }
};

export interface TimelineTramEntry {
  schedule: TripSchedule;
  tram?: Tram;
  progress: number;
  isInService: boolean;
  effectiveDeparture: number;
  effectiveArrival: number;
}

const computeProgress = (currentTime: number, departure: number, arrival: number): number => {
  const duration = Math.max(arrival - departure, 1);
  const progress = (currentTime - departure) / duration;
  return clamp(progress, 0, 1);
};

export const getTimelineEntries = (state: TransitState): TimelineTramEntry[] => {
  const visibleSchedules = getVisibleSchedules(state);

  return visibleSchedules.map((schedule) => {
    const { departure, arrival } = getEffectiveTripWindow(schedule);
    const progress = schedule.status === 'cancelled' ? 0 : computeProgress(state.currentTimeMinutes, departure, arrival);

    return {
      schedule,
      tram: getTramById(state, schedule.tramId),
      progress,
      isInService:
        schedule.status !== 'cancelled' && state.currentTimeMinutes >= departure && state.currentTimeMinutes <= arrival,
      effectiveDeparture: departure,
      effectiveArrival: arrival,
    };
  });
};
