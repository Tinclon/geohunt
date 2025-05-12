import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import { Game } from './components/game/Game';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Game />
      </Box>
    </ThemeProvider>
  );
}

export default App;
