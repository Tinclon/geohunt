import { Box, Typography, Button, Container, Paper } from '@mui/material';
import type { RoleSelectionProps } from './types';

export const RoleSelection = ({ onRoleSelect, onGPSExplanationClick, onCoordinatesExplanationClick, onViewerClick, theme }: RoleSelectionProps) => (
  <Container maxWidth={false} sx={{ 
    pt: 0,
    pb: 0,
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    px: 2,
    overflow: 'hidden'
  }}>
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        textAlign: 'center',
        background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        width: '100%',
        height: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflow: 'auto',
        my: 2
      }}
    >
      <Typography 
        variant="h1" 
        gutterBottom
        sx={{
          fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
          mb: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 1, sm: 2 }
        }}
      >
        Select Your Role
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: { xs: 1, sm: 1.5, md: 2 }, 
        mt: { xs: 1, sm: 1.5, md: 2 },
        mb: { xs: 2, sm: 3, md: 4 }
      }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => onRoleSelect('hawk')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            color: 'black',
            py: { xs: 1, sm: 1.5, md: 2 }
          }}
        >
          Hawk
        </Button>
        <Button
          variant="contained"
          color="info"
          size="large"
          onClick={() => onRoleSelect('bluebird')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            py: { xs: 1, sm: 1.5, md: 2 }
          }}
        >
          Bluebird
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={() => onRoleSelect('falcon')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            py: { xs: 1, sm: 1.5, md: 2 }
          }}
        >
          Falcon
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => onRoleSelect('starling')}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            py: { xs: 1, sm: 1.5, md: 2 }
          }}
        >
          Starling
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onViewerClick}
          sx={{
            width: '100%',
            background: `linear-gradient(45deg, #6a0dad, #4b0082)`,
            color: 'black',
            gridColumn: '1 / -1',
            py: { xs: 1, sm: 1.5, md: 2 },
            mb: { xs: 2, sm: 3, md: 4 },
            '&:hover': {
              background: `linear-gradient(45deg, #4b0082, #6a0dad)`,
            }
          }}
        >
          Owl
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onGPSExplanationClick}
          sx={{
            width: '100%',
            borderColor: theme.palette.grey[400],
            color: theme.palette.grey[400],
            py: { xs: 1, sm: 1.5, md: 2 },
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
            py: { xs: 1, sm: 1.5, md: 2 },
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