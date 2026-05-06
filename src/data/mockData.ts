import type { Direction, Line, Stop, TransitDataset, Tram, TripSchedule } from '../types/transport';

const lineId = 'line-9';

const forwardStops: Stop[] = [
  { id: 'stop-hlavni', name: 'Hlavni nadrazi', order: 1, distanceKm: 0, platformCode: 'A1' },
  { id: 'stop-namesti', name: 'Masarykovo namesti', order: 2, distanceKm: 1.9, platformCode: 'B2' },
  { id: 'stop-riverside', name: 'Riverside Park', order: 3, distanceKm: 3.8, platformCode: 'C1' },
  { id: 'stop-campus', name: 'Tech Campus', order: 4, distanceKm: 6, platformCode: 'D4' },
  { id: 'stop-depot', name: 'Depot Jih', order: 5, distanceKm: 8.6, platformCode: 'E1' },
];

const totalDistance = forwardStops[forwardStops.length - 1].distanceKm;

const reverseStops: Stop[] = [...forwardStops]
  .reverse()
  .map((stop, index) => ({
    id: `${stop.id}-reverse`,
    name: stop.name,
    order: index + 1,
    distanceKm: Number((totalDistance - stop.distanceKm).toFixed(1)),
    platformCode: stop.platformCode,
  }));

const directions: Direction[] = [
  {
    id: 'line-9-east',
    lineId,
    name: 'Eastbound',
    terminalFrom: 'Hlavni nadrazi',
    terminalTo: 'Depot Jih',
    stops: forwardStops,
  },
  {
    id: 'line-9-west',
    lineId,
    name: 'Westbound',
    terminalFrom: 'Depot Jih',
    terminalTo: 'Hlavni nadrazi',
    stops: reverseStops,
  },
];

const lines: Line[] = [
  {
    id: lineId,
    code: '9',
    color: '#00796B',
    displayName: 'Line 9 Riverside Corridor',
    directions,
  },
];

const trams: Tram[] = [
  { id: 'tram-901', fleetNumber: 'T-901', lineId, capacity: 180, accessible: true },
  { id: 'tram-902', fleetNumber: 'T-902', lineId, capacity: 175, accessible: true },
  { id: 'tram-903', fleetNumber: 'T-903', lineId, capacity: 160, accessible: false },
];

const schedules: TripSchedule[] = [
  {
    id: 'trip-901-a',
    lineId,
    directionId: 'line-9-east',
    tramId: 'tram-901',
    departureTime: '06:05',
    arrivalTime: '06:35',
    delayMinutes: 0,
    status: 'onTime',
    notes: 'Morning school run',
  },
  {
    id: 'trip-902-a',
    lineId,
    directionId: 'line-9-east',
    tramId: 'tram-902',
    departureTime: '06:15',
    arrivalTime: '06:45',
    delayMinutes: 4,
    status: 'delayed',
    notes: 'Roadworks near stop 2',
  },
  {
    id: 'trip-903-a',
    lineId,
    directionId: 'line-9-west',
    tramId: 'tram-903',
    departureTime: '06:10',
    arrivalTime: '06:40',
    delayMinutes: 0,
    status: 'onTime',
    notes: 'Accessible support requested',
  },
  {
    id: 'trip-901-b',
    lineId,
    directionId: 'line-9-west',
    tramId: 'tram-901',
    departureTime: '07:00',
    arrivalTime: '07:30',
    delayMinutes: 0,
    status: 'cancelled',
    notes: 'Cancelled by dispatcher',
  },
  {
    id: 'trip-902-b',
    lineId,
    directionId: 'line-9-east',
    tramId: 'tram-902',
    departureTime: '07:05',
    arrivalTime: '07:35',
    delayMinutes: 0,
    status: 'onTime',
  },
];

const cloneStop = (stop: Stop): Stop => ({ ...stop });
const cloneDirection = (direction: Direction): Direction => ({
  ...direction,
  stops: direction.stops.map(cloneStop),
});
const cloneLine = (line: Line): Line => ({
  ...line,
  directions: line.directions.map(cloneDirection),
});
const cloneTram = (tram: Tram): Tram => ({ ...tram });
const cloneSchedule = (schedule: TripSchedule): TripSchedule => ({ ...schedule });

export const createMockDataset = (): TransitDataset => ({
  lines: lines.map(cloneLine),
  trams: trams.map(cloneTram),
  schedules: schedules.map(cloneSchedule),
});
