import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Paper, useTheme, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCurrentPosition, getOpponentCoordinates, calculateDistance, storeCoordinates } from '../services/locationService';
import { GPSExplanation } from './GPSExplanation';

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
  const [myCoordinates, setMyCoordinates] = useState<Coordinates | null>(null);
  const [opponentCoordinates, setOpponentCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flashMyLocation, setFlashMyLocation] = useState(false);
  const [flashOpponentLocation, setFlashOpponentLocation] = useState(false);
  const [flashDistance, setFlashDistance] = useState(false);

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

  const updateMyLocation = async () => {
    try {
      const myPos = await getCurrentPosition();
      setMyCoordinates(myPos);
      if (mode) {
        await storeCoordinates(mode, myPos);
      }
      setFlashMyLocation(true);
      setFlashDistance(true);
      setTimeout(() => {
        setFlashMyLocation(false);
        setFlashDistance(false);
      }, 2000); // Flash for 2 seconds
      setError(null);
    } catch (err) {
      setError(null);
    }
  };

  const updateOpponentLocation = async () => {
    try {
      const opponentPos = await getOpponentCoordinates(opponentMode);
      setOpponentCoordinates(opponentPos);
      setFlashOpponentLocation(true);
      setFlashDistance(true);
      setTimeout(() => {
        setFlashOpponentLocation(false);
        setFlashDistance(false);
      }, 2000); // Flash for 2 seconds
      setError(null);
    } catch (err) {
      setError(null);
    }
  };

  useEffect(() => {
    if (mode) {
      // Initial updates
      updateMyLocation();
      updateOpponentLocation();

      // Set up intervals
      const myLocationInterval = setInterval(updateMyLocation, 1000); // 1 second
      const opponentInterval = setInterval(updateOpponentLocation, 30 * 1000); // 30 seconds

      // Cleanup intervals
      return () => {
        clearInterval(myLocationInterval);
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

  if (!mode) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
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
          <Button
            variant="outlined"
            size="large"
            onClick={handleGPSExplanationClick}
            sx={{
              mt: 4,
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
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: `0 0 20px ${getShadowColor()}`,
          transition: 'box-shadow 0.3s ease',
          position: 'relative',
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
            <Typography 
              variant="body1"
              sx={{
                transition: 'all 0.3s ease',
                ...(flashMyLocation && {
                  color: theme.palette.common.white,
                  textShadow: `0 0 10px ${getModeColor(mode)}`,
                  transform: 'scale(1.05)',
                }),
              }}
            >
              Latitude: {myCoordinates.latitude.toFixed(6)}
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                transition: 'all 0.3s ease',
                ...(flashMyLocation && {
                  color: theme.palette.common.white,
                  textShadow: `0 0 10px ${getModeColor(mode)}`,
                  transform: 'scale(1.05)',
                }),
              }}
            >
              Longitude: {myCoordinates.longitude.toFixed(6)}
            </Typography>
          </Box>
        )}

        {opponentCoordinates && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: getModeColor(opponentMode) }}>
              {opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                transition: 'all 0.3s ease',
                ...(flashOpponentLocation && {
                  color: theme.palette.common.white,
                  textShadow: `0 0 10px ${getModeColor(opponentMode)}`,
                  transform: 'scale(1.05)',
                }),
              }}
            >
              Latitude: {opponentCoordinates.latitude.toFixed(6)}
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                transition: 'all 0.3s ease',
                ...(flashOpponentLocation && {
                  color: theme.palette.common.white,
                  textShadow: `0 0 10px ${getModeColor(opponentMode)}`,
                  transform: 'scale(1.05)',
                }),
              }}
            >
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

        {distance !== null && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: theme.palette.common.white }}>
              Distance
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                transition: 'all 0.3s ease',
                ...(flashDistance && {
                  color: theme.palette.common.white,
                  textShadow: `0 0 10px ${theme.palette.common.white}`,
                  transform: 'scale(1.05)',
                }),
              }}
            >
              {Math.round(distance)} meters
            </Typography>
          </Box>
        )}

        {!distance && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: theme.palette.common.white }}>
              Distance
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.grey[500] }}>
              Unknown
            </Typography>
          </Box>
        )}

        {isClose && (
          <Typography
            variant="h2"
            sx={{
              color: theme.palette.error.main,
              animation: 'flash 1s infinite',
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