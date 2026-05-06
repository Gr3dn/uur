import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00796B',
      dark: '#004D40',
      light: '#48A999',
    },
    secondary: {
      main: '#E65100',
      dark: '#B23C00',
      light: '#FF833A',
    },
    background: {
      default: '#F3F7F7',
      paper: '#FFFFFF',
    },
    warning: {
      main: '#F57C00',
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#2E7D32',
    },
  },
  typography: {
    fontFamily: 'Manrope, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 14px 40px rgba(15, 60, 64, 0.08)',
          border: '1px solid rgba(0, 121, 107, 0.09)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
  },
});
