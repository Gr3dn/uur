import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TramIcon from '@mui/icons-material/Tram';
import { DataGrid, GridActionsCellItem, GridRowEditStopReasons, GridRowModes } from '@mui/x-data-grid';
import type {
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridRowParams,
  GridValueOptionsParams,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useTransitStore } from '../store/TransitStoreContext';
import { getStatusTone, getVisibleSchedules } from '../store/transitSelectors';
import type { AppMode, Line, TramStatus, TripSchedule } from '../types/transport';
import { addMinutesToTime, minutesToTime } from '../utils/time';

type SelectOption = {
  value: string;
  label: string;
};

const STATUS_OPTIONS: TramStatus[] = ['onTime', 'delayed', 'cancelled', 'accident'];
const DEFAULT_TRIP_DURATION_MINUTES = 30;
const DEFAULT_TURNAROUND_MINUTES = 5;

const buildTripId = (): string => `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getOptionLabel = (option: SelectOption | string): string =>
  typeof option === 'string' ? option : option.label;

const getOptionValue = (option: SelectOption | string): string =>
  typeof option === 'string' ? option : option.value;

const getLineLabel = (line: Line): string => `${line.code} - ${line.displayName}`;

export const ScheduleGrid = () => {
  const { t } = useTranslation();
  const { state, actions } = useTransitStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [newRowIds, setNewRowIds] = useState<string[]>([]);

  const rows = useMemo(() => getVisibleSchedules(state), [state]);

  const lineLookup = useMemo(
    () => new Map(state.dataset.lines.map((line) => [line.id, line])),
    [state.dataset.lines],
  );

  const lineOptions = useMemo<SelectOption[]>(
    () =>
      state.dataset.lines.map((line) => ({
        value: line.id,
        label: getLineLabel(line),
      })),
    [state.dataset.lines],
  );

  const directionLabel = useMemo(
    () =>
      new Map(
        state.dataset.lines.flatMap((line) =>
          line.directions.map((direction) => [direction.id, direction.name]),
        ),
      ),
    [state.dataset.lines],
  );

  const tramLabel = useMemo(
    () =>
      new Map(
        state.dataset.trams.map((tram) => [tram.id, `${tram.fleetNumber}${tram.accessible ? ' ♿' : ''}`]),
      ),
    [state.dataset.trams],
  );

  const tramOptions = useCallback(
    (lineId: string): SelectOption[] =>
      state.dataset.trams
        .filter((tram) => tram.lineId === lineId)
        .map((tram) => ({
          value: tram.id,
          label: tramLabel.get(tram.id) ?? tram.fleetNumber,
        })),
    [state.dataset.trams, tramLabel],
  );

  const directionOptions = useCallback(
    (lineId: string): SelectOption[] =>
      (lineLookup.get(lineId)?.directions ?? []).map((direction) => ({
        value: direction.id,
        label: direction.name,
      })),
    [lineLookup],
  );

  const setMode = (event: SelectChangeEvent<AppMode>) => {
    actions.setMode(event.target.value as AppMode);
  };

  const applyPresetUpdate = useCallback(
    (trip: TripSchedule, patch: Partial<TripSchedule>) => {
      const result = actions.saveTrip({ ...trip, ...patch });
      if (!result.ok) {
        setLocalError(result.errorKey ? t(result.errorKey) : t('validation.arrivalAfterDeparture'));
        return;
      }

      setLocalError(null);
    },
    [actions, t],
  );

  const handleRowEditStop = useCallback<GridEventListener<'rowEditStop'>>(
    (params, event) => {
      if (params.reason === GridRowEditStopReasons.rowFocusOut) {
        event.defaultMuiPrevented = true;
        return;
      }

      if (params.reason === GridRowEditStopReasons.escapeKeyDown && newRowIds.includes(String(params.id))) {
        actions.deleteTrip(String(params.id));
        setNewRowIds((prevIds) => prevIds.filter((rowId) => rowId !== String(params.id)));
        setRowModesModel((prevModel) => {
          const nextModel = { ...prevModel };
          delete nextModel[params.id];
          return nextModel;
        });
        setLocalError(null);
      }
    },
    [actions, newRowIds],
  );

  const handleRowModesModelChange = useCallback((nextModel: GridRowModesModel) => {
    setRowModesModel(nextModel);
  }, []);

  const handleEditClick = useCallback((id: GridRowId) => {
    setLocalError(null);
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: GridRowModes.Edit },
    }));
  }, []);

  const handleSaveClick = useCallback((id: GridRowId) => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: GridRowModes.View },
    }));
  }, []);

  const handleDeleteClick = useCallback(
    (id: GridRowId) => {
      actions.deleteTrip(String(id));
      setNewRowIds((prevIds) => prevIds.filter((rowId) => rowId !== String(id)));
      setRowModesModel((prevModel) => {
        const nextModel = { ...prevModel };
        delete nextModel[id];
        return nextModel;
      });
      setLocalError(null);
    },
    [actions],
  );

  const handleCancelClick = useCallback(
    (id: GridRowId) => {
      if (newRowIds.includes(String(id))) {
        actions.deleteTrip(String(id));
        setNewRowIds((prevIds) => prevIds.filter((rowId) => rowId !== String(id)));
        setRowModesModel((prevModel) => {
          const nextModel = { ...prevModel };
          delete nextModel[id];
          return nextModel;
        });
        setLocalError(null);
        return;
      }

      setRowModesModel((prevModel) => ({
        ...prevModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      }));
      setLocalError(null);
    },
    [actions, newRowIds],
  );

  const handleAddTrip = useCallback(() => {
    const lineId = (state.selectedLineId || state.dataset.lines[0]?.id) ?? '';
    const directionId = (state.selectedDirectionId || directionOptions(lineId)[0]?.value) ?? '';
    const tramId = tramOptions(lineId)[0]?.value ?? '';

    if (!lineId || !directionId || !tramId) {
      setLocalError(t('validation.invalidTram'));
      return;
    }

    const anchorTrip = rows[rows.length - 1];
    const departureTime = anchorTrip
      ? addMinutesToTime(anchorTrip.arrivalTime, DEFAULT_TURNAROUND_MINUTES)
      : minutesToTime(state.currentTimeMinutes);

    const newTrip: TripSchedule = {
      id: buildTripId(),
      lineId,
      directionId,
      tramId,
      departureTime,
      arrivalTime: addMinutesToTime(departureTime, DEFAULT_TRIP_DURATION_MINUTES),
      delayMinutes: 0,
      status: 'onTime',
      notes: '',
    };

    const result = actions.saveTrip(newTrip);
    if (!result.ok) {
      setLocalError(result.errorKey ? t(result.errorKey) : t('validation.arrivalAfterDeparture'));
      return;
    }

    setNewRowIds((prevIds) => [...prevIds, newTrip.id]);
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [newTrip.id]: { mode: GridRowModes.Edit, fieldToFocus: 'departureTime' },
    }));
    setLocalError(null);
  }, [
    actions,
    directionOptions,
    rows,
    state.currentTimeMinutes,
    state.dataset.lines,
    state.selectedDirectionId,
    state.selectedLineId,
    t,
    tramOptions,
  ]);

  const processRowUpdate = useCallback(
    (newRow: GridRowModel<TripSchedule>) => {
      const parsedDelay = Number(newRow.delayMinutes);
      const normalizedTrip: TripSchedule = {
        id: String(newRow.id),
        lineId: String(newRow.lineId),
        directionId: String(newRow.directionId),
        tramId: String(newRow.tramId),
        departureTime: String(newRow.departureTime).trim(),
        arrivalTime: String(newRow.arrivalTime).trim(),
        delayMinutes: Number.isNaN(parsedDelay) ? 0 : Math.max(parsedDelay, 0),
        status: STATUS_OPTIONS.includes(newRow.status as TramStatus) ? (newRow.status as TramStatus) : 'onTime',
        notes: newRow.notes ? String(newRow.notes) : '',
      };

      const result = actions.saveTrip(normalizedTrip);
      if (!result.ok) {
        const message = result.errorKey ? t(result.errorKey) : t('validation.arrivalAfterDeparture');
        setLocalError(message);
        throw new Error(message);
      }

      setNewRowIds((prevIds) => prevIds.filter((rowId) => rowId !== normalizedTrip.id));
      setLocalError(null);
      return normalizedTrip;
    },
    [actions, t],
  );

  const columns = useMemo<GridColDef<TripSchedule>[]>(
    () => [
      {
        field: 'lineId',
        headerName: t('grid.columns.line'),
        minWidth: 96,
        editable: true,
        type: 'singleSelect',
        valueOptions: lineOptions,
        getOptionLabel,
        getOptionValue,
        valueSetter: (value, row) => {
          const nextLineId = String(value);
          const nextDirections = directionOptions(nextLineId);
          const nextTrams = tramOptions(nextLineId);
          const lineKeepsDirection = nextDirections.some((option) => option.value === row.directionId);
          const lineKeepsTram = nextTrams.some((option) => option.value === row.tramId);

          return {
            ...row,
            lineId: nextLineId,
            directionId: lineKeepsDirection ? row.directionId : nextDirections[0]?.value ?? '',
            tramId: lineKeepsTram ? row.tramId : nextTrams[0]?.value ?? '',
          };
        },
        renderCell: (params: GridRenderCellParams<TripSchedule, string>) => {
          const line = lineLookup.get(params.value ?? '');
          return <Typography variant="body2">{line?.code ?? params.value}</Typography>;
        },
      },
      {
        field: 'directionId',
        headerName: t('grid.columns.direction'),
        minWidth: 126,
        editable: true,
        type: 'singleSelect',
        valueOptions: (params: GridValueOptionsParams<TripSchedule>) => directionOptions(params.row?.lineId ?? state.selectedLineId),
        getOptionLabel,
        getOptionValue,
        renderCell: (params: GridRenderCellParams<TripSchedule, string>) => (
          <Typography variant="body2">{directionLabel.get(params.value ?? '') ?? params.value}</Typography>
        ),
      },
      {
        field: 'tramId',
        headerName: t('grid.columns.tram'),
        flex: 0.85,
        minWidth: 124,
        editable: true,
        type: 'singleSelect',
        valueOptions: (params: GridValueOptionsParams<TripSchedule>) => tramOptions(params.row?.lineId ?? state.selectedLineId),
        getOptionLabel,
        getOptionValue,
        renderCell: (params: GridRenderCellParams<TripSchedule, string>) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <TramIcon fontSize="small" color="primary" />
            <Typography variant="body2">{tramLabel.get(params.value ?? '') ?? params.value}</Typography>
          </Stack>
        ),
      },
      {
        field: 'departureTime',
        headerName: t('grid.columns.departure'),
        minWidth: 98,
        editable: true,
      },
      {
        field: 'arrivalTime',
        headerName: t('grid.columns.arrival'),
        minWidth: 98,
        editable: true,
      },
      {
        field: 'delayMinutes',
        headerName: t('grid.columns.delay'),
        type: 'number',
        minWidth: 82,
        editable: true,
      },
      {
        field: 'status',
        headerName: t('grid.columns.status'),
        minWidth: 124,
        editable: true,
        type: 'singleSelect',
        valueOptions: STATUS_OPTIONS.map((status) => ({
          value: status,
          label: t(`status.${status}`),
        })),
        getOptionLabel,
        getOptionValue,
        renderCell: (params: GridRenderCellParams<TripSchedule, TramStatus>) => (
          <Chip size="small" color={getStatusTone(params.value ?? 'cancelled')} label={t(`status.${params.value}`)} />
        ),
      },
      {
        field: 'notes',
        headerName: t('grid.columns.notes'),
        minWidth: 150,
        flex: 1.15,
        editable: true,
        cellClassName: 'notes-cell',
        renderCell: (params: GridRenderCellParams<TripSchedule, string>) => (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.3 }}>
            {params.value ?? ''}
          </Typography>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: t('grid.columns.actions'),
        minWidth: 96,
        getActions: (params: GridRowParams<TripSchedule>) => {
          const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                key="save"
                icon={<SaveIcon />}
                label={t('grid.actions.save')}
                onClick={() => handleSaveClick(params.id)}
              />,
              <GridActionsCellItem
                key="cancel-edit"
                icon={<CloseIcon />}
                label={t('grid.actions.cancelEdit')}
                onClick={() => handleCancelClick(params.id)}
                color="inherit"
              />,
            ];
          }

          return [
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label={t('grid.actions.edit')}
              onClick={() => handleEditClick(params.id)}
              color="inherit"
            />,
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label={t('grid.actions.delete')}
              onClick={() => handleDeleteClick(params.id)}
              color="inherit"
            />,
            <GridActionsCellItem
              key="delay"
              icon={<AddAlarmIcon />}
              label={t('grid.actions.delay5')}
              onClick={() =>
                applyPresetUpdate(params.row, {
                  delayMinutes: params.row.delayMinutes + 5,
                  status: 'delayed',
                })
              }
              showInMenu
            />,
            <GridActionsCellItem
              key="accident"
              icon={<WarningAmberIcon />}
              label={t('grid.actions.accident')}
              onClick={() =>
                applyPresetUpdate(params.row, {
                  status: 'accident',
                })
              }
              showInMenu
            />,
            <GridActionsCellItem
              key="cancel-trip"
              icon={<CancelIcon />}
              label={t('grid.actions.cancel')}
              onClick={() =>
                applyPresetUpdate(params.row, {
                  status: 'cancelled',
                })
              }
              showInMenu
            />,
          ];
        },
      },
    ],
    [
      applyPresetUpdate,
      directionLabel,
      directionOptions,
      handleCancelClick,
      handleDeleteClick,
      handleEditClick,
      handleSaveClick,
      lineLookup,
      lineOptions,
      rowModesModel,
      state.selectedLineId,
      t,
      tramLabel,
      tramOptions,
    ],
  );

  return (
    <Paper className="panel panel-grid" elevation={0}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Typography variant="h6">{t('grid.title')}</Typography>

          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddTrip}>
              {t('grid.addTrip')}
            </Button>
            <Typography variant="body2">{t('grid.modeSwitch')}</Typography>
            <Select size="small" value={state.mode} onChange={setMode}>
              <MenuItem value="planning">{t('modes.planning')}</MenuItem>
              <MenuItem value="live">{t('modes.live')}</MenuItem>
            </Select>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {t('grid.helper')}
        </Typography>

        {(localError || state.validationError) && (
          <Alert severity="error">{localError ?? t(state.validationError ?? 'validation.arrivalAfterDeparture')}</Alert>
        )}

        <Box className="grid-shell">
          <DataGrid
            rows={rows}
            columns={columns}
            editMode="row"
            density="compact"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            disableRowSelectionOnClick
            getRowHeight={() => 'auto'}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => {
              setLocalError(error instanceof Error ? error.message : String(error));
            }}
            columnHeaderHeight={60}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                  page: 0,
                },
              },
            }}
            pageSizeOptions={[5, 10]}
            getRowClassName={(params) => `row-status-${params.row.status}`}
            localeText={{
              noRowsLabel: t('grid.empty'),
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
