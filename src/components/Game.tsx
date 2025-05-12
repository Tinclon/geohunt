import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Paper, useTheme, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCurrentPosition, getOpponentCoordinates, calculateDistance, storeCoordinates } from '../services/locationService';
import { GPSExplanation } from './GPSExplanation';
import { CoordinatesExplanation } from './CoordinatesExplanation';
import { CompassIndicator } from './CompassIndicator';

type GameMode = 'hawk' | 'bluebird' | 'falcon' | 'starling';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const Game = () => {
  const theme = useTheme();
  const [mode, setMode] = useState<GameMode | null>(() => {
    const savedMode = localStorage.getItem('gameMode');
    return (savedMode === 'hawk' || savedMode === 'bluebird' || savedMode === 'falcon' || savedMode === 'starling') 
      ? savedMode as GameMode 
      : null;
  });
  const [showGPSExplanation, setShowGPSExplanation] = useState(() => {
    return localStorage.getItem('showGPSExplanation') === 'true';
  });
  const [showCoordinatesExplanation, setShowCoordinatesExplanation] = useState(() => {
    return localStorage.getItem('showCoordinatesExplanation') === 'true';
  });
  const [myCoordinates, setMyCoordinates] = useState<Coordinates | null>(null);
  const [opponentCoordinates, setOpponentCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getOpponentMode = (currentMode: GameMode): GameMode => {
    switch (currentMode) {
      case 'hawk':
        return 'bluebird';
      case 'bluebird':
        return 'hawk';
      case 'falcon':
        return 'starling';
      case 'starling':
        return 'falcon';
    }
  };

  const opponentMode = mode ? getOpponentMode(mode) : 'hawk';

  const handleModeSelect = (selectedMode: GameMode) => {
    setMode(selectedMode);
    localStorage.setItem('gameMode', selectedMode);
  };

  const handleBack = () => {
    setMode(null);
    localStorage.removeItem('gameMode');
  };

  const handleGPSExplanationBack = () => {
    setShowGPSExplanation(false);
    localStorage.removeItem('showGPSExplanation');
  };

  const handleGPSExplanationClick = () => {
    setShowGPSExplanation(true);
    localStorage.setItem('showGPSExplanation', 'true');
  };

  const handleCoordinatesExplanationBack = () => {
    setShowCoordinatesExplanation(false);
    localStorage.removeItem('showCoordinatesExplanation');
  };

  const handleCoordinatesExplanationClick = () => {
    setShowCoordinatesExplanation(true);
    localStorage.setItem('showCoordinatesExplanation', 'true');
  };

  const updateMyLocation = async (saveToServer: boolean = false) => {
    try {
      const myPos = await getCurrentPosition();
      setMyCoordinates(myPos);
      if (mode && saveToServer) {
        await storeCoordinates(mode, myPos);
      }
      setError(null);
    } catch (err) {
      setError(null);
    }
  };

  const updateOpponentLocation = async () => {
    try {
      const opponentPos = await getOpponentCoordinates(opponentMode);
      setOpponentCoordinates(opponentPos);
      setError(null);
    } catch (err) {
      setError(null);
    }
  };

  useEffect(() => {
    if (mode) {
      // Initial updates
      updateMyLocation(true); // Save initial position
      updateOpponentLocation();

      // Set up intervals
      const myLocationInterval = setInterval(() => updateMyLocation(false), 500); // Update display every 0.5 seconds
      const saveLocationInterval = setInterval(() => updateMyLocation(true), 5 * 1000); // Save to server every 5 seconds
      const opponentInterval = setInterval(updateOpponentLocation, 5 * 1000); // Update opponent every 5 seconds

      // Cleanup intervals
      return () => {
        clearInterval(myLocationInterval);
        clearInterval(saveLocationInterval);
        clearInterval(opponentInterval);
      };
    }
  }, [mode]);

  const distance = myCoordinates && opponentCoordinates
    ? calculateDistance(myCoordinates, opponentCoordinates)
    : null;

  const isClose = distance !== null && distance <= 200;
  const isNearby = distance !== null && distance <= 500 && distance > 200;

  const getShadowColor = () => {
    if (isClose) return theme.palette.error.main;
    if (isNearby) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  const getModeColor = (mode: GameMode) => {
    switch (mode) {
      case 'hawk':
        return theme.palette.error.main;
      case 'bluebird':
        return theme.palette.info.main;
      case 'falcon':
        return theme.palette.warning.main;
      case 'starling':
        return theme.palette.success.main;
    }
  };

  if (showGPSExplanation) {
    return <GPSExplanation onBack={handleGPSExplanationBack} />;
  }

  if (showCoordinatesExplanation) {
    return <CoordinatesExplanation onBack={handleCoordinatesExplanationBack} />;
  }

  if (!mode) {
    return (
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
            Choose Your Mode
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
              onClick={() => handleModeSelect('hawk')}
              sx={{
                width: '100%',
                background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              }}
            >
              Hawk
            </Button>
            <Button
              variant="contained"
              color="info"
              size="large"
              onClick={() => handleModeSelect('bluebird')}
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
              onClick={() => handleModeSelect('falcon')}
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
              onClick={() => handleModeSelect('starling')}
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
              onClick={handleGPSExplanationClick}
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
              onClick={handleCoordinatesExplanationClick}
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
  }

  return (
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
          background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: `0 0 20px ${getShadowColor()}`,
          transition: 'box-shadow 0.3s ease',
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: theme.palette.grey[400],
            '&:hover': {
              color: theme.palette.grey[200],
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <CompassIndicator />

        <Typography 
          variant="h1" 
          gutterBottom
          sx={{
            color: getModeColor(mode),
            pr: 6,
          }}
        >
          You are a {mode}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {myCoordinates && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: getModeColor(mode) }}>
              Your Location
            </Typography>
            <Typography variant="body1">
              Latitude: {myCoordinates.latitude.toFixed(6)}
            </Typography>
            <Typography variant="body1">
              Longitude: {myCoordinates.longitude.toFixed(6)}
            </Typography>
          </Box>
        )}

        {opponentCoordinates && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: getModeColor(opponentMode) }}>
              {opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location
            </Typography>
            <Typography variant="body1">
              Latitude: {opponentCoordinates.latitude.toFixed(6)}
            </Typography>
            <Typography variant="body1">
              Longitude: {opponentCoordinates.longitude.toFixed(6)}
            </Typography>
          </Box>
        )}

        {!opponentCoordinates && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: getModeColor(opponentMode) }}>
              {opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.grey[500] }}>
              Unknown
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h2" gutterBottom sx={{ color: theme.palette.common.white }}>
            Distance
          </Typography>
          <Typography 
            variant="body1"
            sx={{
              ...(!distance && { color: theme.palette.grey[500] }),
            }}
          >
            {distance !== null ? `${Math.round(distance)} meters` : 'Unknown'}
          </Typography>
        </Box>

        {isClose && (
          <Typography
            variant="h3"
            sx={{
              color: theme.palette.error.main,
              animation: 'flash 1s infinite',
              fontSize: '1.5rem',
              '@keyframes flash': {
                '0%': { 
                  opacity: 1,
                  textShadow: `0 0 20px ${theme.palette.error.main}`,
                },
                '50%': { 
                  opacity: 0.5,
                  textShadow: `0 0 10px ${theme.palette.error.main}`,
                },
                '100%': { 
                  opacity: 1,
                  textShadow: `0 0 20px ${theme.palette.error.main}`,
                },
              },
            }}
          >
            WARNING: Opponent is nearby!
          </Typography>
        )}
      </Paper>
    </Container>
  );
}; 