import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import './i18n';
import { appTheme } from './theme/theme';
import { TransitStoreProvider } from './store/TransitStoreContext';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/tree.css';
import './styles/grid.css';
import './styles/timeline.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <TransitStoreProvider>
        <App />
      </TransitStoreProvider>
    </ThemeProvider>
  </StrictMode>,
);
