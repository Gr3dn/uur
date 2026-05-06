import type { TripSchedule } from '../types/transport';

const MINUTES_IN_DAY = 24 * 60;

export const timeToMinutes = (value: string): number => {
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return NaN;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return NaN;
  }

  return hours * 60 + minutes;
};

export const minutesToTime = (value: number): string => {
  const normalized = ((Math.floor(value) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (normalized % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const addMinutesToTime = (time: string, delta: number): string => {
  const base = timeToMinutes(time);
  if (Number.isNaN(base)) {
    return time;
  }
  return minutesToTime(base + delta);
};

export const isArrivalAfterDeparture = (departure: string, arrival: string): boolean => {
  const departureMinutes = timeToMinutes(departure);
  const arrivalMinutes = timeToMinutes(arrival);

  if (Number.isNaN(departureMinutes) || Number.isNaN(arrivalMinutes)) {
    return false;
  }

  return arrivalMinutes >= departureMinutes;
};

export const getEffectiveTripWindow = (
  schedule: Pick<TripSchedule, 'departureTime' | 'arrivalTime' | 'delayMinutes'>,
): { departure: number; arrival: number } => {
  const departureBase = timeToMinutes(schedule.departureTime);
  const arrivalBase = timeToMinutes(schedule.arrivalTime);

  if (Number.isNaN(departureBase) || Number.isNaN(arrivalBase)) {
    return { departure: 0, arrival: 0 };
  }

  const delayedDeparture = departureBase + schedule.delayMinutes;
  const delayedArrival = arrivalBase + schedule.delayMinutes;

  return {
    departure: delayedDeparture,
    arrival: delayedArrival,
  };
};

export const formatClock = (minutes: number): string => minutesToTime(minutes);
