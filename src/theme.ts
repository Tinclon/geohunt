import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9d',
      light: '#66ffc2',
      dark: '#00cc7d',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff3d71',
      light: '#ff6b94',
      dark: '#cc2f5a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    error: {
      main: '#ff1744',
      light: '#ff616f',
      dark: '#c4001d',
    },
    warning: {
      main: '#ffd600',
      light: '#ffff52',
      dark: '#c7a500',
    },
    info: {
      main: '#00e5ff',
      light: '#6effff',
      dark: '#00b2cc',
    },
    success: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1.25rem',
      color: '#e0e0e0',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          padding: '12px 24px',
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 255, 157, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          boxShadow: '0 0 20px rgba(0, 255, 157, 0.1)',
        },
      },
    },
  },
}); 