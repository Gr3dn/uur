import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import TramIcon from '@mui/icons-material/Tram';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PlaceIcon from '@mui/icons-material/Place';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useTranslation } from 'react-i18next';
import type { MouseEvent } from 'react';
import { useTransitStore } from '../store/TransitStoreContext';

const LINE_PREFIX = 'line:';
const DIRECTION_PREFIX = 'direction:';
const STOP_PREFIX = 'stop:';

const lineNodeId = (lineId: string): string => `${LINE_PREFIX}${lineId}`;
const directionNodeId = (directionId: string): string => `${DIRECTION_PREFIX}${directionId}`;
const stopNodeId = (directionId: string, stopId: string): string => `${STOP_PREFIX}${directionId}:${stopId}`;

export const RouteTree = () => {
  const { t } = useTranslation();
  const { state, actions } = useTransitStore();

  const handleItemClick = (_event: MouseEvent, itemId: string) => {
    // Tree -> Store binding: route selection drives both grid data and map rendering.
    if (itemId.startsWith(LINE_PREFIX)) {
      actions.selectLine(itemId.replace(LINE_PREFIX, ''));
      return;
    }

    if (itemId.startsWith(DIRECTION_PREFIX)) {
      actions.selectDirection(itemId.replace(DIRECTION_PREFIX, ''));
      return;
    }

    if (itemId.startsWith(STOP_PREFIX)) {
      const parsed = itemId.replace(STOP_PREFIX, '').split(':');
      const directionId = parsed[0];
      if (directionId) {
        actions.selectDirection(directionId);
      }
    }
  };

  return (
    <Paper className="panel panel-tree" elevation={0}>
      <Stack spacing={1.5}>
        <Typography variant="h6">{t('tree.title')}</Typography>
        <SimpleTreeView selectedItems={directionNodeId(state.selectedDirectionId)} onItemClick={handleItemClick}>
          {state.dataset.lines.map((line) => (
            <TreeItem
              key={line.id}
              itemId={lineNodeId(line.id)}
              label={
                <Box className="tree-node-label">
                  <TramIcon sx={{ color: line.color }} fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {t('tree.line')} {line.code}: {line.displayName}
                  </Typography>
                </Box>
              }
            >
              {line.directions.map((direction) => (
                <TreeItem
                  key={direction.id}
                  itemId={directionNodeId(direction.id)}
                  label={
                    <Box className="tree-node-label">
                      <SwapHorizIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t('tree.direction')}: {direction.terminalFrom} {'->'} {direction.terminalTo}
                      </Typography>
                      <Chip size="small" label={direction.name} color="secondary" variant="outlined" />
                    </Box>
                  }
                >
                  {direction.stops.map((stop) => (
                    <TreeItem
                      key={stop.id}
                      itemId={stopNodeId(direction.id, stop.id)}
                      label={
                        <Box className="tree-node-label tree-stop-label">
                          <PlaceIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {t('tree.stop')}: {stop.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${t('tree.platform')} ${stop.platformCode}`}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeItem>
          ))}
        </SimpleTreeView>
      </Stack>
    </Paper>
  );
};
