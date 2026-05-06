import { Alert, Box, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AboutDialog } from './components/AboutDialog';
import { AppHeader } from './components/AppHeader';
import { RouteTree } from './components/RouteTree';
import { ScheduleGrid } from './components/ScheduleGrid';
import { TimelineMap } from './components/TimelineMap';
import { useTransitStore } from './store/TransitStoreContext';
import { formatClock } from './utils/time';

const App = () => {
  const { t } = useTranslation();
  const { state, actions } = useTransitStore();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showMessage = (key: string) => {
    setSnackbarMessage(t(key));
  };

  const handleSaveState = () => {
    // Explicit user-triggered persistence for semester requirement (LocalStorage save/load).
    actions.saveSnapshot();
    showMessage('storage.saved');
  };

  const handleLoadState = () => {
    const loaded = actions.loadSnapshot();
    showMessage(loaded ? 'storage.loaded' : 'storage.missing');
  };

  const handleResetMock = () => {
    actions.resetMock();
    showMessage('storage.reset');
  };

  return (
    <Box className="app-shell">
      <AppHeader
        mode={state.mode}
        clockLabel={formatClock(state.currentTimeMinutes)}
        language={state.language}
        onLanguageChange={actions.setLanguage}
        onSaveState={handleSaveState}
        onLoadState={handleLoadState}
        onResetMock={handleResetMock}
        onOpenAbout={() => setAboutOpen(true)}
      />

      <Box className="dashboard-grid">
        <Box className="dashboard-left">
          <RouteTree />
        </Box>

        <Box className="dashboard-right">
          <Box className="dashboard-top">
            <ScheduleGrid />
          </Box>
          <Box className="dashboard-bottom">
            <TimelineMap />
          </Box>
        </Box>
      </Box>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={2600}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert variant="filled" severity="info" onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
