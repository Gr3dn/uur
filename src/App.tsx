import { Alert, Box, Drawer, Snackbar } from '@mui/material';
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
  const [routesOpen, setRoutesOpen] = useState(false);
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

  const routeSidebar = (
    <Box className="mobile-route-content">
      <RouteTree />
    </Box>
  );

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
        onOpenRoutes={() => setRoutesOpen(true)}
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

      <Drawer
        open={routesOpen}
        onClose={() => setRoutesOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: 'mobile-route-drawer-paper' }}
      >
        {routeSidebar}
      </Drawer>

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
