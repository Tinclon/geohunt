import { Box, Typography, Button, Container, Paper } from '@mui/material';
import type { ModeSelectionProps } from './types';

export const RoleSelection = ({ onModeSelect, onGPSExplanationClick, onCoordinatesExplanationClick, theme }: ModeSelectionProps) => (
  <Container maxWidth={false} sx={{ 
    pt: 4,
    width: '100%',
    height: '95vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2
  }}>
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Typography variant="h1" gutterBottom>
        Select Your Role
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 2, 
        mt: 2 
      }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => onModeSelect('hawk')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            color: 'black'
          }}
        >
          Hawk
        </Button>
        <Button
          variant="contained"
          color="info"
          size="large"
          onClick={() => onModeSelect('bluebird')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          }}
        >
          Bluebird
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={() => onModeSelect('falcon')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
          }}
        >
          Falcon
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => onModeSelect('starling')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          }}
        >
          Starling
        </Button>
      </Box>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 2,
        mt: 4
      }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onGPSExplanationClick}
          sx={{
            width: '100%',
            borderColor: theme.palette.grey[400],
            color: theme.palette.grey[400],
            '&:hover': {
              borderColor: theme.palette.grey[200],
              color: theme.palette.grey[200],
            },
          }}
        >
          How GPS Works
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onCoordinatesExplanationClick}
          sx={{
            width: '100%',
            borderColor: theme.palette.grey[400],
            color: theme.palette.grey[400],
            '&:hover': {
              borderColor: theme.palette.grey[200],
              color: theme.palette.grey[200],
            },
          }}
        >
          How Coordinates Work
        </Button>
      </Box>
    </Paper>
  </Container>
); 