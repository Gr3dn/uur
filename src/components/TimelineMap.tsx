import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TramIcon from '@mui/icons-material/Tram';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransitStore } from '../store/TransitStoreContext';
import { getSelectedDirection, getSelectedLine, getTimelineEntries, getStatusTone } from '../store/transitSelectors';
import type { Stop } from '../types/transport';
import { formatClock } from '../utils/time';

type MarkerPoint = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const getMarkerPoint = (stops: Stop[], progress: number): MarkerPoint => {
  if (!stops.length) {
    return { x: 0, y: 0 };
  }

  if (stops.length === 1) {
    return { x: stops[0].mapX, y: stops[0].mapY };
  }

  const maxDistance = stops[stops.length - 1].distanceKm || 1;
  const targetDistance = clamp(progress, 0, 1) * maxDistance;

  for (let index = 0; index < stops.length - 1; index += 1) {
    const currentStop = stops[index];
    const nextStop = stops[index + 1];

    if (targetDistance > nextStop.distanceKm && index < stops.length - 2) {
      continue;
    }

    const segmentDistance = nextStop.distanceKm - currentStop.distanceKm || 1;
    const segmentProgress = clamp((targetDistance - currentStop.distanceKm) / segmentDistance, 0, 1);

    return {
      x: currentStop.mapX + (nextStop.mapX - currentStop.mapX) * segmentProgress,
      y: currentStop.mapY + (nextStop.mapY - currentStop.mapY) * segmentProgress,
    };
  }

  const lastStop = stops[stops.length - 1];
  return { x: lastStop.mapX, y: lastStop.mapY };
};

export const TimelineMap = () => {
  const { t } = useTranslation();
  const { state, actions } = useTransitStore();

  const selectedLine = useMemo(() => getSelectedLine(state), [state]);
  const selectedDirection = useMemo(() => getSelectedDirection(state), [state]);
  const entries = useMemo(() => getTimelineEntries(state), [state]);

  if (!selectedDirection || !selectedLine) {
    return (
      <Paper className="panel panel-map" elevation={0}>
        <Typography>{t('map.noDirection')}</Typography>
      </Paper>
    );
  }

  const polylinePoints = selectedDirection.stops.map((stop) => `${stop.mapX},${stop.mapY}`).join(' ');

  return (
    <Paper className="panel panel-map" elevation={0}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Box className="map-header">
          <Box>
            <Typography variant="h6">{t('map.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLine.code} / {selectedDirection.terminalFrom} {'->'} {selectedDirection.terminalTo}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="map-header-actions">
            <Chip label={`${t('map.clock')}: ${formatClock(state.currentTimeMinutes)}`} color="primary" variant="outlined" />
            <Chip
              label={state.mode === 'planning' ? t('modes.planning') : t('modes.live')}
              color={state.mode === 'planning' ? 'default' : 'secondary'}
              variant="outlined"
            />
            <Button
              size="small"
              variant={state.isPlaying ? 'contained' : 'outlined'}
              startIcon={state.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={actions.togglePlay}
              disabled={state.mode !== 'live'}
            >
              {state.isPlaying ? t('grid.pause') : t('grid.play')}
            </Button>
          </Stack>
        </Box>

        {state.mode !== 'live' && <Alert severity="info">{t('map.liveHint')}</Alert>}

        <Box className="route-map-canvas">
          <svg className="route-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={t('map.title')}>
            <polyline
              points={polylinePoints}
              className="route-map-polyline"
              style={{ stroke: selectedLine.color }}
            />
          </svg>

          {selectedDirection.stops.map((stop) => (
            <Box
              key={stop.id}
              className="route-map-stop"
              style={{
                left: `${stop.mapX}%`,
                top: `${stop.mapY}%`,
              }}
            >
              <Box className="route-map-stop-dot" style={{ borderColor: selectedLine.color }} />
              <Typography variant="caption" className="route-map-stop-label">
                {stop.name}
              </Typography>
              <Typography variant="caption" className="route-map-stop-platform">
                {stop.platformCode}
              </Typography>
            </Box>
          ))}

          {entries.map((entry) => {
            const point = getMarkerPoint(selectedDirection.stops, entry.progress);
            const markerClass =
              entry.schedule.status === 'accident'
                ? 'route-map-tram route-map-tram-accident'
                : `route-map-tram route-map-tram-${entry.schedule.status}`;

            return (
              <Box
                key={entry.schedule.id}
                className={markerClass}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  opacity: entry.isInService ? 1 : 0.55,
                }}
                title={`${entry.tram?.fleetNumber ?? entry.schedule.tramId} - ${t(`status.${entry.schedule.status}`)}`}
              >
                {entry.schedule.status === 'accident' ? (
                  <WarningAmberIcon fontSize="inherit" className="route-map-tram-alert-icon" />
                ) : (
                  <TramIcon fontSize="inherit" className="route-map-tram-icon" />
                )}
                <Typography variant="caption" className="route-map-tram-label">
                  {entry.tram?.fleetNumber ?? entry.schedule.tramId}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" color={getStatusTone('onTime')} label={t('status.onTime')} />
          <Chip size="small" color={getStatusTone('delayed')} label={t('status.delayed')} />
          <Chip size="small" color={getStatusTone('cancelled')} label={t('status.cancelled')} />
          <Chip size="small" color={getStatusTone('accident')} label={t('status.accident')} />
        </Stack>
      </Stack>
    </Paper>
  );
};
