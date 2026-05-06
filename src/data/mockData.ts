import type { Direction, Line, Stop, TransitDataset, Tram, TripSchedule } from '../types/transport';

const line9Id = 'line-9';
const line4Id = 'line-4';

const line9ForwardStops: Stop[] = [
  { id: 'stop-hlavni', name: 'Hlavni nadrazi', order: 1, distanceKm: 0, mapX: 8, mapY: 74, platformCode: 'A1' },
  { id: 'stop-namesti', name: 'Masarykovo namesti', order: 2, distanceKm: 1.9, mapX: 22, mapY: 58, platformCode: 'B2' },
  { id: 'stop-riverside', name: 'Riverside Park', order: 3, distanceKm: 3.8, mapX: 40, mapY: 40, platformCode: 'C1' },
  { id: 'stop-campus', name: 'Tech Campus', order: 4, distanceKm: 6, mapX: 66, mapY: 44, platformCode: 'D4' },
  { id: 'stop-depot', name: 'Depot Jih', order: 5, distanceKm: 8.6, mapX: 88, mapY: 66, platformCode: 'E1' },
];

const line4ForwardStops: Stop[] = [
  { id: 'stop-bory', name: 'Bory', order: 1, distanceKm: 0, mapX: 10, mapY: 72, platformCode: 'K1' },
  { id: 'stop-miru', name: 'Namesti Miru', order: 2, distanceKm: 1.5, mapX: 26, mapY: 54, platformCode: 'L2' },
  { id: 'stop-sady', name: 'Sady Petatricatniku', order: 3, distanceKm: 3.2, mapX: 44, mapY: 34, platformCode: 'M1' },
  { id: 'stop-fakulta', name: 'Lekarska fakulta', order: 4, distanceKm: 5, mapX: 64, mapY: 36, platformCode: 'N3' },
  { id: 'stop-kosutka', name: 'Kosutka', order: 5, distanceKm: 8.1, mapX: 88, mapY: 18, platformCode: 'P1' },
];

const reverseStops = (stops: Stop[]): Stop[] => {
  const totalDistance = stops[stops.length - 1]?.distanceKm ?? 0;
  return [...stops].reverse().map((stop, index) => ({
    ...stop,
    id: `${stop.id}-reverse`,
    order: index + 1,
    distanceKm: Number((totalDistance - stop.distanceKm).toFixed(1)),
  }));
};

const line9Directions: Direction[] = [
  {
    id: 'line-9-east',
    lineId: line9Id,
    name: 'Eastbound',
    terminalFrom: 'Hlavni nadrazi',
    terminalTo: 'Depot Jih',
    stops: line9ForwardStops,
  },
  {
    id: 'line-9-west',
    lineId: line9Id,
    name: 'Westbound',
    terminalFrom: 'Depot Jih',
    terminalTo: 'Hlavni nadrazi',
    stops: reverseStops(line9ForwardStops),
  },
];

const line4Directions: Direction[] = [
  {
    id: 'line-4-outbound',
    lineId: line4Id,
    name: 'Bory to Kosutka',
    terminalFrom: 'Bory',
    terminalTo: 'Kosutka',
    stops: line4ForwardStops,
  },
  {
    id: 'line-4-inbound',
    lineId: line4Id,
    name: 'Kosutka to Bory',
    terminalFrom: 'Kosutka',
    terminalTo: 'Bory',
    stops: reverseStops(line4ForwardStops),
  },
];

const lines: Line[] = [
  {
    id: line9Id,
    code: '9',
    color: '#00796B',
    displayName: 'Line 9 Riverside Corridor',
    directions: line9Directions,
  },
  {
    id: line4Id,
    code: '4',
    color: '#E65100',
    displayName: 'Line 4 University Axis',
    directions: line4Directions,
  },
];

const trams: Tram[] = [
  { id: 'tram-901', fleetNumber: 'T-901', lineId: line9Id, capacity: 180, accessible: true },
  { id: 'tram-902', fleetNumber: 'T-902', lineId: line9Id, capacity: 175, accessible: true },
  { id: 'tram-903', fleetNumber: 'T-903', lineId: line9Id, capacity: 160, accessible: false },
  { id: 'tram-401', fleetNumber: 'T-401', lineId: line4Id, capacity: 165, accessible: true },
  { id: 'tram-402', fleetNumber: 'T-402', lineId: line4Id, capacity: 162, accessible: false },
  { id: 'tram-403', fleetNumber: 'T-403', lineId: line4Id, capacity: 170, accessible: true },
];

const schedules: TripSchedule[] = [
  {
    id: 'trip-901-a',
    lineId: line9Id,
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
    lineId: line9Id,
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
    lineId: line9Id,
    directionId: 'line-9-west',
    tramId: 'tram-903',
    departureTime: '06:12',
    arrivalTime: '06:42',
    delayMinutes: 0,
    status: 'onTime',
    notes: 'Accessible support requested',
  },
  {
    id: 'trip-901-b',
    lineId: line9Id,
    directionId: 'line-9-west',
    tramId: 'tram-901',
    departureTime: '07:00',
    arrivalTime: '07:30',
    delayMinutes: 0,
    status: 'cancelled',
    notes: 'Cancelled by dispatcher',
  },
  {
    id: 'trip-401-a',
    lineId: line4Id,
    directionId: 'line-4-outbound',
    tramId: 'tram-401',
    departureTime: '06:08',
    arrivalTime: '06:41',
    delayMinutes: 0,
    status: 'onTime',
    notes: 'Campus feeder service',
  },
  {
    id: 'trip-402-a',
    lineId: line4Id,
    directionId: 'line-4-outbound',
    tramId: 'tram-402',
    departureTime: '06:22',
    arrivalTime: '06:55',
    delayMinutes: 6,
    status: 'delayed',
    notes: 'Heavy traffic near center',
  },
  {
    id: 'trip-403-a',
    lineId: line4Id,
    directionId: 'line-4-inbound',
    tramId: 'tram-403',
    departureTime: '06:18',
    arrivalTime: '06:50',
    delayMinutes: 0,
    status: 'onTime',
    notes: 'Regular return service',
  },
  {
    id: 'trip-401-b',
    lineId: line4Id,
    directionId: 'line-4-inbound',
    tramId: 'tram-401',
    departureTime: '07:05',
    arrivalTime: '07:38',
    delayMinutes: 0,
    status: 'accident',
    notes: 'Minor collision reported at stop 3',
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
