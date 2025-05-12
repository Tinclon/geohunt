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
import { BrickoutGame } from './BrickoutGame';
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
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    const savedState = localStorage.getItem('isRunning');
    return savedState === 'true';
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
  const [formattedMyCoordinates, setFormattedMyCoordinates] = useState<{ latitude: string; longitude: string; } | null>(null);
  const [formattedOpponentCoordinates, setFormattedOpponentCoordinates] = useState<{ latitude: string; longitude: string; } | null>(null);
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
    setIsRunning(false);
    localStorage.removeItem('isRunning');
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

  const updateDifficulty = async (newDifficulty: Difficulty, updateServer: boolean = true) => {
    setDifficulty(newDifficulty);
    localStorage.setItem('gameDifficulty', newDifficulty);
    
    if (updateServer && myCoordinates) {
      await storeCoordinates(mode!, { ...myCoordinates, difficulty: newDifficulty });
    }
  };

  const handleDifficultyChange = async () => {
    const difficulties: Difficulty[] = ['Hard', 'Medium', 'Easy'];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    const newDifficulty = difficulties[nextIndex];
    
    // Only update server if we're in predator mode
    const shouldUpdateServer = mode === 'hawk' || mode === 'falcon';
    await updateDifficulty(newDifficulty, shouldUpdateServer);
  };

  const handleCoordinateSystemChange = () => {
    const newSystem = coordinateSystem === 'decimal' ? 'dms' : 'decimal';
    setCoordinateSystem(newSystem);
    localStorage.setItem('coordinateSystem', newSystem);
  };

  const formatCoordinate = (value: number, isLatitude: boolean) => {
    if (coordinateSystem === 'decimal') {
      const formatted = value.toFixed(6).replace(/\.?0+$/, '');
      // Pad the integer part for consistent comparison
      const [intPart, decPart] = formatted.split('.');
      const paddedInt = intPart.padStart(4, '\u00A0'); // Using non-breaking space
      return decPart ? `${paddedInt}.${decPart}` : paddedInt;
    } else {
      const dms = decimalToDMS(value, isLatitude);
      return formatDMS(dms);
    }
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
        const latChanges = findChangedChars(prevMyLatRef.current, newLat);
        setHighlightMyLat(latChanges);
        setTimeout(() => setHighlightMyLat([]), 400);
      }

      // Handle longitude changes
      if (prevMyLngRef.current && prevMyLngRef.current !== newLng) {
        const lngChanges = findChangedChars(prevMyLngRef.current, newLng);
        setHighlightMyLng(lngChanges);
        setTimeout(() => setHighlightMyLng([]), 400);
      }

      // Update previous values and coordinates
      prevMyLatRef.current = newLat;
      prevMyLngRef.current = newLng;
      setMyCoordinates(myPos);
      setFormattedMyCoordinates({ latitude: newLat, longitude: newLng });
      
      if (mode && saveToServer) {
        const currentDifficulty = localStorage.getItem('gameDifficulty') as Difficulty || 'Hard';
        await storeCoordinates(mode, { ...myPos, difficulty: currentDifficulty });
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
          const latChanges = findChangedChars(prevOpponentLatRef.current, newLat);
          setHighlightOpponentLat(latChanges);
          setTimeout(() => setHighlightOpponentLat([]), 400);
        }

        // Handle longitude changes
        if (prevOpponentLngRef.current && prevOpponentLngRef.current !== newLng) {
          const lngChanges = findChangedChars(prevOpponentLngRef.current, newLng);
          setHighlightOpponentLng(lngChanges);
          setTimeout(() => setHighlightOpponentLng([]), 400);
        }

        // Update previous values and coordinates
        prevOpponentLatRef.current = newLat;
        prevOpponentLngRef.current = newLng;
        setOpponentCoordinates(opponentPos);
        setFormattedOpponentCoordinates({ latitude: newLat, longitude: newLng });

        // For prey modes, update difficulty to match opponent's difficulty
        if ((mode === 'bluebird' || mode === 'starling') && 'difficulty' in opponentPos) {
          const opponentDifficulty = opponentPos.difficulty as Difficulty;
          await updateDifficulty(opponentDifficulty, false);
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
          // Store current coordinates as previous before updating
          if (myCoordinates) {
            setPrevMyCoordinates({ ...myCoordinates });
          }

          // Update raw coordinates first
          setMyCoordinates(position);

          // Format coordinates according to current system
          const newLat = formatCoordinate(position.latitude, true);
          const newLng = formatCoordinate(position.longitude, false);

          // Handle latitude changes
          if (prevMyLatRef.current && prevMyLatRef.current !== newLat) {
            const latChanges = findChangedChars(prevMyLatRef.current, newLat);
            setHighlightMyLat(latChanges);
            setTimeout(() => setHighlightMyLat([]), 400);
          }

          // Handle longitude changes
          if (prevMyLngRef.current && prevMyLngRef.current !== newLng) {
            const lngChanges = findChangedChars(prevMyLngRef.current, newLng);
            setHighlightMyLng(lngChanges);
            setTimeout(() => setHighlightMyLng([]), 400);
          }

          // Update previous values and formatted coordinates
          prevMyLatRef.current = newLat;
          prevMyLngRef.current = newLng;
          setFormattedMyCoordinates({ latitude: newLat, longitude: newLng });
          
          // Save to server
          if (mode) {
            const currentDifficulty = localStorage.getItem('gameDifficulty') as Difficulty || 'Hard';
            storeCoordinates(mode, { ...position, difficulty: currentDifficulty });
          }
        },
        () => {
          setError(null);
        }
      );

      // Set up intervals for server updates and opponent location
      const saveLocationInterval = setInterval(() => {
        if (myCoordinates) {
          const currentDifficulty = localStorage.getItem('gameDifficulty') as Difficulty || 'Hard';
          storeCoordinates(mode, { ...myCoordinates, difficulty: currentDifficulty });
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
  }, [mode, coordinateSystem]);

  useEffect(() => {
    if (distance !== null) {
      const newDistance = distance.toString();
      
      // Handle distance changes
      if (prevDistanceRef.current && prevDistanceRef.current !== newDistance) {
        const distanceChanges = findChangedChars(prevDistanceRef.current, newDistance);
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

  // Update formatted coordinates when coordinate system changes
  useEffect(() => {
    if (myCoordinates) {
      setFormattedMyCoordinates({
        latitude: formatCoordinate(myCoordinates.latitude, true),
        longitude: formatCoordinate(myCoordinates.longitude, false)
      });
    }
    if (opponentCoordinates) {
      setFormattedOpponentCoordinates({
        latitude: formatCoordinate(opponentCoordinates.latitude, true),
        longitude: formatCoordinate(opponentCoordinates.longitude, false)
      });
    }
  }, [coordinateSystem]);

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

  const handleRunningToggle = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    localStorage.setItem('isRunning', newState.toString());
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
      pt: 2,
      pb: 2,
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      px: 2,
      overflow: 'hidden'
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
          flexDirection: 'column',
          overflow: 'auto'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: isRunning ? 0 : 4
        }}>
          {isRunning ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" sx={{ 
                  minWidth: '80px',
                  fontFamily: '"Roboto Mono", "SF Mono", "Consolas", "Liberation Mono", "Menlo", "Courier", monospace',
                  color: 'white',
                }}>
                  {distance !== null ? (
                    <>
                      {renderHighlightedNumber(distance.toString(), highlightDistance)}
                      &nbsp;{distance === 1 ? 'meter' : 'meters'}
                    </>
                  ) : (
                    'Unknown'
                  )}
                </Typography>
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
                    WARNING
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={handleBack}
                sx={{
                  color: theme.palette.grey[400],
                  '&:hover': {
                    color: theme.palette.grey[200],
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </>
          ) : (
            <>
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
            </>
          )}
        </Box>

        {!isRunning && (
          <>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <LocationDisplay
              title="Your Location"
              coordinates={formattedMyCoordinates}
              highlightLat={highlightMyLat}
              highlightLng={highlightMyLng}
              color={getModeColor(mode)}
              renderHighlightedNumber={(value, highlights) => renderHighlightedNumber(value, highlights)}
              prevCoordinates={prevMyCoordinates ? {
                latitude: formatCoordinate(prevMyCoordinates.latitude, true),
                longitude: formatCoordinate(prevMyCoordinates.longitude, false)
              } : null}
              difficulty={difficulty}
            />

            <LocationDisplay
              title={`${opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location`}
              coordinates={formattedOpponentCoordinates}
              highlightLat={highlightOpponentLat}
              highlightLng={highlightOpponentLng}
              color={getModeColor(opponentMode)}
              renderHighlightedNumber={(value, highlights) => renderHighlightedNumber(value, highlights)}
              prevCoordinates={prevOpponentCoordinates ? {
                latitude: formatCoordinate(prevOpponentCoordinates.latitude, true),
                longitude: formatCoordinate(prevOpponentCoordinates.longitude, false)
              } : null}
              difficulty={difficulty}
            />

            <DistanceDisplay
              distance={distance}
              highlightDistance={highlightDistance}
              renderHighlightedNumber={(value, highlights) => renderHighlightedNumber(value, highlights)}
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
                  mb: 4,
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
          </>
        )}

        {isRunning && (
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            maxHeight: 'calc(100% - 200px)',
            mb: 4
          }}>
            <BrickoutGame />
          </Box>
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
              minWidth: 90,
              bgcolor: 'grey.700',
              '&:hover': {
                bgcolor: 'grey.600',
              },
              color: 'grey.300'
            }}
          >
            {coordinateSystem === 'decimal' ? 'Decimal' : 'DMS'}
          </Button>

          <Button
            variant="contained"
            onClick={handleDifficultyChange}
            disabled={mode === 'bluebird' || mode === 'starling'}
            sx={{ 
              minWidth: 90,
              color: 'black',
              background: difficulty === 'Hard' ? 
                `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})` :
                difficulty === 'Medium' ?
                `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})` :
                `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              '&:hover': {
                background: difficulty === 'Hard' ? 
                  `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})` :
                  difficulty === 'Medium' ?
                  `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})` :
                  `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
              },
              '&.Mui-disabled': {
                background: difficulty === 'Hard' ? 
                  `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})` :
                  difficulty === 'Medium' ?
                  `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})` :
                  `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                opacity: 0.5,
                color: 'black'
              }
            }}
          >
            {difficulty}
          </Button>

          {(mode === 'bluebird' || mode === 'starling') && (
            <Button
              variant="contained"
              onClick={handleRunningToggle}
              sx={{ 
                minWidth: 90,
                color: 'black',
                background: isRunning ? 
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` :
                  `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                '&:hover': {
                  background: isRunning ? 
                    `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` :
                    `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                }
              }}
            >
              {isRunning ? "Hiding" : "Running"}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};