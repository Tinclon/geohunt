import { useState, useEffect, useRef } from 'react';
import { Typography, Container, Paper, useTheme, IconButton, Button, ButtonGroup } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCurrentPosition, getOpponentCoordinates, calculateDistance, storeCoordinates, watchPosition } from '../../services/locationService';
import { GPSExplanation } from '../GPSExplanation';
import { CoordinatesExplanation } from '../CoordinatesExplanation';
import { CompassIndicator } from '../CompassIndicator';
import { LocationDisplay } from './LocationDisplay';
import { DistanceDisplay } from './DistanceDisplay';
import { ModeSelection } from './ModeSelection';
import type { GameMode, Coordinates } from './types';
import { findChangedDigits, getOpponentMode } from './utils';

type Difficulty = 'Hard' | 'Medium' | 'Easy';

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
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const savedDifficulty = localStorage.getItem('gameDifficulty');
    return (savedDifficulty === 'Hard' || savedDifficulty === 'Medium' || savedDifficulty === 'Easy')
      ? savedDifficulty as Difficulty
      : 'Hard';
  });
  const prevMyLatRef = useRef<string>('');
  const prevMyLngRef = useRef<string>('');
  const prevOpponentLatRef = useRef<string>('');
  const prevOpponentLngRef = useRef<string>('');
  const prevDistanceRef = useRef<string>('');
  const [showGPSExplanation, setShowGPSExplanation] = useState(() => {
    return localStorage.getItem('showGPSExplanation') === 'true';
  });
  const [showCoordinatesExplanation, setShowCoordinatesExplanation] = useState(() => {
    return localStorage.getItem('showCoordinatesExplanation') === 'true';
  });
  const [myCoordinates, setMyCoordinates] = useState<Coordinates | null>(null);
  const [opponentCoordinates, setOpponentCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightMyLat, setHighlightMyLat] = useState<number[]>([]);
  const [highlightMyLng, setHighlightMyLng] = useState<number[]>([]);
  const [highlightOpponentLat, setHighlightOpponentLat] = useState<number[]>([]);
  const [highlightOpponentLng, setHighlightOpponentLng] = useState<number[]>([]);
  const [highlightDistance, setHighlightDistance] = useState<number[]>([]);
  const watchIdRef = useRef<number>(-1);
  const [prevMyCoordinates, setPrevMyCoordinates] = useState<Coordinates | null>(null);
  const [prevOpponentCoordinates, setPrevOpponentCoordinates] = useState<Coordinates | null>(null);

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

  const handleDifficultyChange = () => {
    const difficulties: Difficulty[] = ['Hard', 'Medium', 'Easy'];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    const newDifficulty = difficulties[nextIndex];
    setDifficulty(newDifficulty);
    localStorage.setItem('gameDifficulty', newDifficulty);
  };

  const formatCoordinate = (value: number) => {
    return value.toFixed(6).replace(/\.?0+$/, '');
  };

  const findChangedDigits = (prev: string, curr: string, shouldPad: boolean = false) => {
    let prevValue = prev;
    let currValue = curr;
    
    if (shouldPad) {
      const [prevInt, prevDec] = prev.split('.');
      const [currInt, currDec] = curr.split('.');
      const prevPadded = prevInt.padStart(4, '\u00A0');
      const currPadded = currInt.padStart(4, '\u00A0');
      prevValue = prevDec ? `${prevPadded}.${prevDec}` : prevPadded;
      currValue = currDec ? `${currPadded}.${currDec}` : currPadded;
    }

    const changes: number[] = [];
    const maxLength = Math.max(prevValue.length, currValue.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (prevValue[i] !== currValue[i]) {
        changes.push(i);
      }
    }
    
    return changes;
  };

  const updateMyLocation = async (saveToServer: boolean = false) => {
    try {
      const myPos = await getCurrentPosition();
      const newLat = formatCoordinate(myPos.latitude);
      const newLng = formatCoordinate(myPos.longitude);

      // Store current coordinates as previous before updating
      if (myCoordinates) {
        setPrevMyCoordinates({ ...myCoordinates });
      }

      // Handle latitude changes
      if (prevMyLatRef.current && prevMyLatRef.current !== newLat) {
        const latChanges = findChangedDigits(prevMyLatRef.current, newLat, true);
        setHighlightMyLat(latChanges);
        setTimeout(() => setHighlightMyLat([]), 400);
      }

      // Handle longitude changes
      if (prevMyLngRef.current && prevMyLngRef.current !== newLng) {
        const lngChanges = findChangedDigits(prevMyLngRef.current, newLng, true);
        setHighlightMyLng(lngChanges);
        setTimeout(() => setHighlightMyLng([]), 400);
      }

      // Update previous values and coordinates
      prevMyLatRef.current = newLat;
      prevMyLngRef.current = newLng;
      setMyCoordinates(myPos);
      
      if (mode && saveToServer) {
        await storeCoordinates(mode, myPos, difficulty);
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
        const newLat = formatCoordinate(opponentPos.latitude);
        const newLng = formatCoordinate(opponentPos.longitude);

        // Store current coordinates as previous before updating
        if (opponentCoordinates) {
          setPrevOpponentCoordinates({ ...opponentCoordinates });
        }

        // Handle latitude changes
        if (prevOpponentLatRef.current && prevOpponentLatRef.current !== newLat) {
          const latChanges = findChangedDigits(prevOpponentLatRef.current, newLat, true);
          setHighlightOpponentLat(latChanges);
          setTimeout(() => setHighlightOpponentLat([]), 400);
        }

        // Handle longitude changes
        if (prevOpponentLngRef.current && prevOpponentLngRef.current !== newLng) {
          const lngChanges = findChangedDigits(prevOpponentLngRef.current, newLng, true);
          setHighlightOpponentLng(lngChanges);
          setTimeout(() => setHighlightOpponentLng([]), 400);
        }

        // Update previous values and coordinates
        prevOpponentLatRef.current = newLat;
        prevOpponentLngRef.current = newLng;
        setOpponentCoordinates(opponentPos);
      }
      setError(null);
    } catch (err) {
      setError(null);
    }
  };

  const distance = myCoordinates && opponentCoordinates
    ? Math.round(calculateDistance(myCoordinates, opponentCoordinates))
    : null;

  useEffect(() => {
    if (mode) {
      // Initial updates
      updateMyLocation(true); // Save initial position
      updateOpponentLocation();

      // Set up watch position
      watchIdRef.current = watchPosition(
        (position) => {
          const newLat = formatCoordinate(position.latitude);
          const newLng = formatCoordinate(position.longitude);

          // Store current coordinates as previous before updating
          if (myCoordinates) {
            setPrevMyCoordinates({ ...myCoordinates });
          }

          // Handle latitude changes
          if (prevMyLatRef.current && prevMyLatRef.current !== newLat) {
            const latChanges = findChangedDigits(prevMyLatRef.current, newLat, true);
            setHighlightMyLat(latChanges);
            setTimeout(() => setHighlightMyLat([]), 400);
          }

          // Handle longitude changes
          if (prevMyLngRef.current && prevMyLngRef.current !== newLng) {
            const lngChanges = findChangedDigits(prevMyLngRef.current, newLng, true);
            setHighlightMyLng(lngChanges);
            setTimeout(() => setHighlightMyLng([]), 400);
          }

          // Update previous values and coordinates
          prevMyLatRef.current = newLat;
          prevMyLngRef.current = newLng;
          setMyCoordinates(position);
        },
        () => {
          setError(null);
        }
      );

      // Set up intervals for server updates and opponent location
      const saveLocationInterval = setInterval(() => {
        if (myCoordinates) {
          storeCoordinates(mode, myCoordinates, difficulty);
        }
      }, 5 * 1000);
      const opponentInterval = setInterval(updateOpponentLocation, 5 * 1000);

      // Cleanup intervals and watch position
      return () => {
        if (watchIdRef.current !== -1) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        clearInterval(saveLocationInterval);
        clearInterval(opponentInterval);
      };
    }
  }, [mode]);

  useEffect(() => {
    if (distance !== null) {
      const newDistance = distance.toString();
      
      // Handle distance changes
      if (prevDistanceRef.current && prevDistanceRef.current !== newDistance) {
        const distanceChanges = findChangedDigits(prevDistanceRef.current, newDistance, false);
        setHighlightDistance(distanceChanges);
        setTimeout(() => setHighlightDistance([]), 400);
      }
      
      prevDistanceRef.current = newDistance;
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

  const renderHighlightedNumber = (value: string, highlights: number[], shouldPad: boolean = false) => {
    let displayValue = value;
    
    if (shouldPad) {
      const [intPart, decPart] = value.split('.');
      const paddedInt = intPart.padStart(4, '\u00A0'); // Using non-breaking space
      displayValue = decPart ? `${paddedInt}.${decPart}` : paddedInt;
    }
    
    return displayValue.split('').map((char, index) => (
      <span
        key={index}
        style={{
          fontWeight: highlights.includes(index) ? 'bold' : 'normal',
          transition: 'all 0.4s ease',
          color: highlights.includes(index) ? theme.palette.primary.main : 'inherit',
          display: 'inline-block',
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
      <ModeSelection
        onModeSelect={handleModeSelect}
        onGPSExplanationClick={handleGPSExplanationClick}
        onCoordinatesExplanationClick={handleCoordinatesExplanationClick}
        theme={theme}
      />
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
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <LocationDisplay
          title="Your Location"
          coordinates={myCoordinates}
          highlightLat={highlightMyLat}
          highlightLng={highlightMyLng}
          color={getModeColor(mode)}
          renderHighlightedNumber={(value, highlights) => renderHighlightedNumber(value, highlights, true)}
          prevCoordinates={prevMyCoordinates}
          difficulty={difficulty}
        />

        <LocationDisplay
          title={`${opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location`}
          coordinates={opponentCoordinates}
          highlightLat={highlightOpponentLat}
          highlightLng={highlightOpponentLng}
          color={getModeColor(opponentMode)}
          renderHighlightedNumber={(value, highlights) => renderHighlightedNumber(value, highlights, true)}
          prevCoordinates={prevOpponentCoordinates}
          difficulty={difficulty}
        />

        <DistanceDisplay
          distance={distance}
          highlightDistance={highlightDistance}
          renderHighlightedNumber={(value, highlights) => renderHighlightedNumber(value, highlights, false)}
          theme={theme}
        />

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

        <Button
          variant="contained"
          onClick={handleDifficultyChange}
          sx={{ 
            mt: 'auto',
            alignSelf: 'center',
            mb: 2,
            minWidth: 120,
            color: 'white',
            bgcolor: difficulty === 'Hard' ? 'error.main' : 
                    difficulty === 'Medium' ? 'warning.main' : 
                    'success.main',
            '&:hover': {
              bgcolor: difficulty === 'Hard' ? 'error.dark' : 
                      difficulty === 'Medium' ? 'warning.dark' : 
                      'success.dark',
            }
          }}
        >
          {difficulty}
        </Button>
      </Paper>
    </Container>
  );
}; 