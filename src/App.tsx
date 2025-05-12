import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Game } from './components/game/Game';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Game />
    </ThemeProvider>
  );
}

export default App;
