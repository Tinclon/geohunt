import { useState, useEffect, useRef } from 'react';
import { Typography, Container, Paper, useTheme, IconButton, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCurrentPosition, getOpponentCoordinates, calculateDistance, storeCoordinates, watchPosition } from '../../services/locationService';
import { GPSExplanation } from '../GPSExplanation';
import { CoordinatesExplanation } from '../CoordinatesExplanation';
import { CompassIndicator } from '../CompassIndicator';
import { LocationDisplay } from './LocationDisplay';
import { DistanceDisplay } from './DistanceDisplay';
import { ModeSelection } from './ModeSelection';
import type { GameMode, Coordinates } from './types';
import type { CoordinateSystem } from './utils';
import { findChangedChars, getOpponentMode, decimalToDMS, formatDMS } from './utils';

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
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem>(() => {
    const saved = localStorage.getItem('coordinateSystem');
    return (saved === 'decimal' || saved === 'dms') ? saved as CoordinateSystem : 'decimal';
  });

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

  const handleDifficultyChange = async () => {
    const difficulties: Difficulty[] = ['Hard', 'Medium', 'Easy'];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    const newDifficulty = difficulties[nextIndex];
    setDifficulty(newDifficulty);
    localStorage.setItem('gameDifficulty', newDifficulty);

    // Update server with new difficulty immediately
    if (mode && myCoordinates) {
      await storeCoordinates(mode, myCoordinates, newDifficulty);
    }
  };

  const handleCoordinateSystemChange = () => {
    const newSystem = coordinateSystem === 'decimal' ? 'dms' : 'decimal';
    setCoordinateSystem(newSystem);
    localStorage.setItem('coordinateSystem', newSystem);
  };

  const formatCoordinate = (value: number, isLatitude: boolean) => {
    if (coordinateSystem === 'decimal') {
      return value.toFixed(6).replace(/\.?0+$/, '');
    } else {
      const dms = decimalToDMS(value, isLatitude);
      return formatDMS(dms);
    }
  };

  const formatForComparison = (value: string, shouldPad: boolean = false) => {
    if (shouldPad) {
      const [intPart, decPart] = value.split('.');
      const paddedInt = intPart.padStart(4, '\u00A0'); // Using non-breaking space
      return decPart ? `${paddedInt}.${decPart}` : paddedInt;
    }
    return value;
  };

  const renderHighlightedNumber = (value: string, highlights: number[]) => {
    return value.split('').map((char, index) => (
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

  const updateMyLocation = async (saveToServer: boolean = false) => {
    try {
      const myPos = await getCurrentPosition();
      const newLat = formatCoordinate(myPos.latitude, true);
      const newLng = formatCoordinate(myPos.longitude, false);

      // Store current coordinates as previous before updating
      if (myCoordinates) {
        setPrevMyCoordinates({ ...myCoordinates });
      }

      // Handle latitude changes
      if (prevMyLatRef.current && prevMyLatRef.current !== newLat) {
        const formattedPrev = formatForComparison(prevMyLatRef.current, true);
        const formattedNew = formatForComparison(newLat, true);
        const latChanges = findChangedChars(formattedPrev, formattedNew);
        setHighlightMyLat(latChanges);
        setTimeout(() => setHighlightMyLat([]), 400);
      }

      // Handle longitude changes
      if (prevMyLngRef.current && prevMyLngRef.current !== newLng) {
        const formattedPrev = formatForComparison(prevMyLngRef.current, false);
        const formattedNew = formatForComparison(newLng, false);
        const lngChanges = findChangedChars(formattedPrev, formattedNew);
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
        const newLat = formatCoordinate(opponentPos.latitude, true);
        const newLng = formatCoordinate(opponentPos.longitude, false);

        // Store current coordinates as previous before updating
        if (opponentCoordinates) {
          setPrevOpponentCoordinates({ ...opponentCoordinates });
        }

        // Handle latitude changes
        if (prevOpponentLatRef.current && prevOpponentLatRef.current !== newLat) {
          const formattedPrev = formatForComparison(prevOpponentLatRef.current, true);
          const formattedNew = formatForComparison(newLat, true);
          const latChanges = findChangedChars(formattedPrev, formattedNew);
          setHighlightOpponentLat(latChanges);
          setTimeout(() => setHighlightOpponentLat([]), 400);
        }

        // Handle longitude changes
        if (prevOpponentLngRef.current && prevOpponentLngRef.current !== newLng) {
          const formattedPrev = formatForComparison(prevOpponentLngRef.current, false);
          const formattedNew = formatForComparison(newLng, false);
          const lngChanges = findChangedChars(formattedPrev, formattedNew);
          setHighlightOpponentLng(lngChanges);
          setTimeout(() => setHighlightOpponentLng([]), 400);
        }

        // Update previous values and coordinates
        prevOpponentLatRef.current = newLat;
        prevOpponentLngRef.current = newLng;
        setOpponentCoordinates(opponentPos);

        // For prey modes, update difficulty to match opponent's difficulty
        if ((mode === 'bluebird' || mode === 'starling') && 'difficulty' in opponentPos) {
          const opponentDifficulty = opponentPos.difficulty as Difficulty;
          setDifficulty(opponentDifficulty);
          localStorage.setItem('gameDifficulty', opponentDifficulty);
          
          // Update server with new difficulty
          if (myCoordinates) {
            await storeCoordinates(mode, myCoordinates, opponentDifficulty);
          }
        }
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
          const newLat = formatCoordinate(position.latitude, true);
          const newLng = formatCoordinate(position.longitude, false);

          // Store current coordinates as previous before updating
          if (myCoordinates) {
            setPrevMyCoordinates({ ...myCoordinates });
          }

          // Handle latitude changes
          if (prevMyLatRef.current && prevMyLatRef.current !== newLat) {
            const formattedPrev = formatForComparison(prevMyLatRef.current, true);
            const formattedNew = formatForComparison(newLat, true);
            const latChanges = findChangedChars(formattedPrev, formattedNew);
            setHighlightMyLat(latChanges);
            setTimeout(() => setHighlightMyLat([]), 400);
          }

          // Handle longitude changes
          if (prevMyLngRef.current && prevMyLngRef.current !== newLng) {
            const formattedPrev = formatForComparison(prevMyLngRef.current, false);
            const formattedNew = formatForComparison(newLng, false);
            const lngChanges = findChangedChars(formattedPrev, formattedNew);
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
        const formattedPrev = formatForComparison(prevDistanceRef.current, false);
        const formattedNew = formatForComparison(newDistance, false);
        const distanceChanges = findChangedChars(formattedPrev, formattedNew);
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
          coordinates={myCoordinates ? {
            latitude: formatCoordinate(myCoordinates.latitude, true),
            longitude: formatCoordinate(myCoordinates.longitude, false)
          } : null}
          highlightLat={highlightMyLat}
          highlightLng={highlightMyLng}
          color={getModeColor(mode)}
          renderHighlightedNumber={(value, isLatitude) => renderHighlightedNumber(formatForComparison(value, true), isLatitude ? highlightMyLat : highlightMyLng)}
          prevCoordinates={prevMyCoordinates ? {
            latitude: formatCoordinate(prevMyCoordinates.latitude, true),
            longitude: formatCoordinate(prevMyCoordinates.longitude, false)
          } : null}
          difficulty={difficulty}
        />

        <LocationDisplay
          title={`${opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location`}
          coordinates={opponentCoordinates ? {
            latitude: formatCoordinate(opponentCoordinates.latitude, true),
            longitude: formatCoordinate(opponentCoordinates.longitude, false)
          } : null}
          highlightLat={highlightOpponentLat}
          highlightLng={highlightOpponentLng}
          color={getModeColor(opponentMode)}
          renderHighlightedNumber={(value, isLatitude) => renderHighlightedNumber(formatForComparison(value, true), isLatitude ? highlightOpponentLat : highlightOpponentLng)}
          prevCoordinates={prevOpponentCoordinates ? {
            latitude: formatCoordinate(prevOpponentCoordinates.latitude, true),
            longitude: formatCoordinate(prevOpponentCoordinates.longitude, false)
          } : null}
          difficulty={difficulty}
        />

        <DistanceDisplay
          distance={distance}
          highlightDistance={highlightDistance}
          renderHighlightedNumber={(value) => renderHighlightedNumber(formatForComparison(value, false), highlightDistance)}
          theme={theme}
          myCoordinates={myCoordinates}
          opponentCoordinates={opponentCoordinates}
          difficulty={difficulty}
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

        <Box sx={{ 
          mt: 'auto',
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          mb: 2
        }}>
          <Button
            variant="contained"
            onClick={handleCoordinateSystemChange}
            sx={{ 
              minWidth: 120,
              bgcolor: 'grey.700',
              '&:hover': {
                bgcolor: 'grey.600',
              },
              color: 'grey.300',
              fontWeight: 'bold'
            }}
          >
            {coordinateSystem === 'decimal' ? 'DMS' : 'Decimal'}
          </Button>

          <Button
            variant="contained"
            onClick={handleDifficultyChange}
            disabled={mode === 'bluebird' || mode === 'starling'}
            sx={{ 
              minWidth: 120,
              color: 'white',
              bgcolor: difficulty === 'Hard' ? 'error.main' : 
                      difficulty === 'Medium' ? 'warning.main' : 
                      'success.main',
              '&:hover': {
                bgcolor: difficulty === 'Hard' ? 'error.dark' : 
                        difficulty === 'Medium' ? 'warning.dark' : 
                        'success.dark',
              },
              '&.Mui-disabled': {
                bgcolor: difficulty === 'Hard' ? 'error.dark' : 
                        difficulty === 'Medium' ? 'warning.dark' : 
                        'success.dark',
                opacity: 0.5,
                color: 'white'
              }
            }}
          >
            {difficulty}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};