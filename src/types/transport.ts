export type AppMode = 'planning' | 'live';

export type Language = 'en' | 'cs';

export type TramStatus = 'onTime' | 'delayed' | 'cancelled' | 'accident';

export interface Stop {
  id: string;
  name: string;
  order: number;
  distanceKm: number;
  platformCode: string;
}

export interface Direction {
  id: string;
  lineId: string;
  name: string;
  terminalFrom: string;
  terminalTo: string;
  stops: Stop[];
}

export interface Line {
  id: string;
  code: string;
  color: string;
  displayName: string;
  directions: Direction[];
}

export interface Tram {
  id: string;
  fleetNumber: string;
  lineId: string;
  capacity: number;
  accessible: boolean;
}

export interface TripSchedule {
  id: string;
  lineId: string;
  directionId: string;
  tramId: string;
  departureTime: string;
  arrivalTime: string;
  delayMinutes: number;
  status: TramStatus;
  notes?: string;
}

export interface TransitDataset {
  lines: Line[];
  trams: Tram[];
  schedules: TripSchedule[];
}

export interface TransitState {
  dataset: TransitDataset;
  selectedLineId: string;
  selectedDirectionId: string;
  mode: AppMode;
  isPlaying: boolean;
  currentTimeMinutes: number;
  language: Language;
  validationError: string | null;
}

export type TripValidationErrorKey =
  | 'validation.arrivalAfterDeparture'
  | 'validation.invalidTime'
  | 'validation.invalidDirection'
  | 'validation.invalidTram';

export interface UpdateTripResult {
  ok: boolean;
  errorKey?: TripValidationErrorKey;
}
