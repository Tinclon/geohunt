import { useState, useEffect, useRef } from 'react';
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
  const myLatTimeoutRef = useRef<number | undefined>(undefined);
  const myLngTimeoutRef = useRef<number | undefined>(undefined);
  const opponentLatTimeoutRef = useRef<number | undefined>(undefined);
  const opponentLngTimeoutRef = useRef<number | undefined>(undefined);
  const distanceTimeoutRef = useRef<number | undefined>(undefined);
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
  const [prevMyLat, setPrevMyLat] = useState<string>('');
  const [prevMyLng, setPrevMyLng] = useState<string>('');
  const [prevOpponentLat, setPrevOpponentLat] = useState<string>('');
  const [prevOpponentLng, setPrevOpponentLng] = useState<string>('');
  const [prevDistance, setPrevDistance] = useState<string>('');
  const [highlightMyLat, setHighlightMyLat] = useState<number[]>([]);
  const [highlightMyLng, setHighlightMyLng] = useState<number[]>([]);
  const [highlightOpponentLat, setHighlightOpponentLat] = useState<number[]>([]);
  const [highlightOpponentLng, setHighlightOpponentLng] = useState<number[]>([]);
  const [highlightDistance, setHighlightDistance] = useState<number[]>([]);

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

  const findChangedDigits = (oldStr: string, newStr: string): number[] => {
    const changes: number[] = [];
    let i = 0;
    let j = 0;
    
    // Find the first difference
    while (i < oldStr.length && j < newStr.length && oldStr[i] === newStr[j]) {
      i++;
      j++;
    }
    
    // If we found a difference, mark all characters from this point until the next matching character
    if (i < oldStr.length || j < newStr.length) {
      const startDiff = i;
      
      // Find where the strings match again
      while (i < oldStr.length && j < newStr.length && oldStr[i] !== newStr[j]) {
        i++;
        j++;
      }
      
      // Add all positions that changed
      for (let k = startDiff; k < i; k++) {
        changes.push(k);
      }
    }
    
    return changes;
  };

  const updateMyLocation = async (saveToServer: boolean = false) => {
    try {
      const myPos = await getCurrentPosition();
      const newLat = myPos.latitude.toFixed(6);
      const newLng = myPos.longitude.toFixed(6);

      // First, check for changes and set highlights
      if (prevMyLat) {
        const latChanges = findChangedDigits(prevMyLat, newLat);
        if (latChanges.length > 0) {
          setHighlightMyLat(latChanges);
          // Clear any existing timeouts
          if (myLatTimeoutRef.current) {
            clearTimeout(myLatTimeoutRef.current);
          }
          myLatTimeoutRef.current = setTimeout(() => {
            setHighlightMyLat([]);
          }, 250);
        }
      }

      if (prevMyLng) {
        const lngChanges = findChangedDigits(prevMyLng, newLng);
        if (lngChanges.length > 0) {
          setHighlightMyLng(lngChanges);
          // Clear any existing timeouts
          if (myLngTimeoutRef.current) {
            clearTimeout(myLngTimeoutRef.current);
          }
          myLngTimeoutRef.current = setTimeout(() => {
            setHighlightMyLng([]);
          }, 250);
        }
      }

      // Then update the coordinates and previous values
      setPrevMyLat(newLat);
      setPrevMyLng(newLng);
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
      if (opponentPos) {
        const newLat = opponentPos.latitude.toFixed(6);
        const newLng = opponentPos.longitude.toFixed(6);

        // First, check for changes and set highlights
        if (prevOpponentLat) {
          const latChanges = findChangedDigits(prevOpponentLat, newLat);
          if (latChanges.length > 0) {
            setHighlightOpponentLat(latChanges);
            // Clear any existing timeouts
            if (opponentLatTimeoutRef.current) {
              clearTimeout(opponentLatTimeoutRef.current);
            }
            opponentLatTimeoutRef.current = setTimeout(() => {
              setHighlightOpponentLat([]);
            }, 250);
          }
        }

        if (prevOpponentLng) {
          const lngChanges = findChangedDigits(prevOpponentLng, newLng);
          if (lngChanges.length > 0) {
            setHighlightOpponentLng(lngChanges);
            // Clear any existing timeouts
            if (opponentLngTimeoutRef.current) {
              clearTimeout(opponentLngTimeoutRef.current);
            }
            opponentLngTimeoutRef.current = setTimeout(() => {
              setHighlightOpponentLng([]);
            }, 250);
          }
        }

        // Then update the coordinates and previous values
        setPrevOpponentLat(newLat);
        setPrevOpponentLng(newLng);
        setOpponentCoordinates(opponentPos);
      }
      setError(null);
    } catch (err) {
      setError(null);
    }
  };

  const distance = myCoordinates && opponentCoordinates
    ? calculateDistance(myCoordinates, opponentCoordinates)
    : null;

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

  useEffect(() => {
    if (distance !== null) {
      const newDistance = Math.round(distance).toString();
      
      // First, check for changes and set highlights
      if (prevDistance) {
        const distanceChanges = findChangedDigits(prevDistance, newDistance);
        if (distanceChanges.length > 0) {
          setHighlightDistance(distanceChanges);
          // Clear any existing timeouts
          if (distanceTimeoutRef.current) {
            clearTimeout(distanceTimeoutRef.current);
          }
          distanceTimeoutRef.current = setTimeout(() => {
            setHighlightDistance([]);
          }, 250);
        }
      }
      
      // Then update the previous value
      setPrevDistance(newDistance);
    }
  }, [distance]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (myLatTimeoutRef.current) clearTimeout(myLatTimeoutRef.current);
      if (myLngTimeoutRef.current) clearTimeout(myLngTimeoutRef.current);
      if (opponentLatTimeoutRef.current) clearTimeout(opponentLatTimeoutRef.current);
      if (opponentLngTimeoutRef.current) clearTimeout(opponentLngTimeoutRef.current);
      if (distanceTimeoutRef.current) clearTimeout(distanceTimeoutRef.current);
    };
  }, []);

  const isClose = distance !== null && distance <= 50;
  const isNearby = distance !== null && distance <= 500 && distance > 50;

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

  const renderHighlightedNumber = (value: string, highlights: number[]) => {
    return value.split('').map((char, index) => (
      <span
        key={index}
        style={{
          fontWeight: highlights.includes(index) ? 'bold' : 'normal',
          transition: 'all 0.25s ease',
          color: highlights.includes(index) ? theme.palette.primary.main : 'inherit',
          backgroundColor: highlights.includes(index) ? theme.palette.primary.main + '20' : 'transparent',
        }}
      >
        {char}
      </span>
    ));
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
              Latitude: {renderHighlightedNumber(myCoordinates.latitude.toFixed(6), highlightMyLat)}
            </Typography>
            <Typography variant="body1">
              Longitude: {renderHighlightedNumber(myCoordinates.longitude.toFixed(6), highlightMyLng)}
            </Typography>
          </Box>
        )}

        {opponentCoordinates && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ color: getModeColor(opponentMode) }}>
              {opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location
            </Typography>
            <Typography variant="body1">
              Latitude: {renderHighlightedNumber(opponentCoordinates.latitude.toFixed(6), highlightOpponentLat)}
            </Typography>
            <Typography variant="body1">
              Longitude: {renderHighlightedNumber(opponentCoordinates.longitude.toFixed(6), highlightOpponentLng)}
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
            {distance !== null 
              ? `${renderHighlightedNumber(Math.round(distance).toString(), highlightDistance)} meters`
              : 'Unknown'}
          </Typography>
        </Box>

        {isClose && (
          <Typography
            variant="h3"
            sx={{
              color: theme.palette.error.main,
              animation: 'flash 1s infinite',
              fontSize: '1.2rem',
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