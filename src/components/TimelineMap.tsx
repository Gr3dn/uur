import { Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransitStore } from '../store/TransitStoreContext';
import { getSelectedDirection, getTimelineEntries } from '../store/transitSelectors';

const ROUTE_WIDTH = 980;
const ROUTE_HEIGHT = 260;
const MAP_PADDING = 60;

const statusColorMap: Record<string, string> = {
  onTime: '#2E7D32',
  delayed: '#F57C00',
  cancelled: '#6D6D6D',
  accident: '#D32F2F',
};

export const TimelineMap = () => {
  const { t } = useTranslation();
  const { state } = useTransitStore();

  const selectedDirection = useMemo(() => getSelectedDirection(state), [state]);
  const entries = useMemo(() => getTimelineEntries(state), [state]);

  if (!selectedDirection) {
    return (
      <Paper className="panel panel-map" elevation={0}>
        <Typography>{t('map.noDirection')}</Typography>
      </Paper>
    );
  }

  const maxDistance = selectedDirection.stops[selectedDirection.stops.length - 1]?.distanceKm || 1;
  const lineY = 86;

  const distanceToX = (distanceKm: number): number => {
    const ratio = maxDistance === 0 ? 0 : distanceKm / maxDistance;
    return MAP_PADDING + ratio * (ROUTE_WIDTH - MAP_PADDING * 2);
  };

  return (
    <Paper className="panel panel-map" elevation={0}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Typography variant="h6">{t('map.title')}</Typography>

        <svg viewBox={`0 0 ${ROUTE_WIDTH} ${ROUTE_HEIGHT}`} className="timeline-map" role="img" aria-label={t('map.title')}>
          <defs>
            <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#004D40" />
              <stop offset="50%" stopColor="#00796B" />
              <stop offset="100%" stopColor="#26A69A" />
            </linearGradient>
          </defs>

          <line
            x1={MAP_PADDING}
            y1={lineY}
            x2={ROUTE_WIDTH - MAP_PADDING}
            y2={lineY}
            stroke="url(#routeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {selectedDirection.stops.map((stop) => {
            const x = distanceToX(stop.distanceKm);
            return (
              <g key={stop.id}>
                <circle cx={x} cy={lineY} r={9} fill="#ffffff" stroke="#00796B" strokeWidth={4} />
                <text x={x} y={lineY + 30} textAnchor="middle" className="stop-label">
                  {stop.name}
                </text>
                <text x={x} y={lineY + 48} textAnchor="middle" className="stop-sub-label">
                  {stop.platformCode}
                </text>
              </g>
            );
          })}

          {
            // Reactive binding: whenever table/tree changes schedule status or route selection,
            // these markers re-render from global store without direct component coupling.
            entries.map((entry, index) => {
              const x = distanceToX(entry.progress * maxDistance);
              const y = 150 + index * 28;
              const baseClass =
                entry.schedule.status === 'accident' ? 'tram-marker tram-accident' : 'tram-marker';

              return (
                <g key={entry.schedule.id} className={baseClass}>
                  <line x1={x} y1={lineY + 10} x2={x} y2={y - 10} stroke="#A0B8B6" strokeDasharray="4 3" />
                  <circle
                    cx={x}
                    cy={y}
                    r={10}
                    fill={statusColorMap[entry.schedule.status]}
                    opacity={entry.isInService ? 1 : 0.65}
                  />
                  <text x={x + 16} y={y + 4} className="tram-label">
                    {entry.tram?.fleetNumber ?? entry.schedule.tramId}
                  </text>
                </g>
              );
            })
          }
        </svg>
      </Stack>
    </Paper>
  );
};
