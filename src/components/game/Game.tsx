import { useState, useEffect, useRef } from 'react';
import { Typography, Container, Paper, useTheme, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCurrentPosition, getOpponentCoordinates, calculateDistance, storeCoordinates } from '../../services/locationService';
import { GPSExplanation } from '../GPSExplanation';
import { CoordinatesExplanation } from '../CoordinatesExplanation';
import { CompassIndicator } from '../CompassIndicator';
import { LocationDisplay } from './LocationDisplay';
import { DistanceDisplay } from './DistanceDisplay';
import { ModeSelection } from './ModeSelection';
import type { GameMode, Coordinates } from './types';
import { findChangedDigits, getOpponentMode } from './utils';

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
      const newLat = myPos.latitude.toFixed(6);
      const newLng = myPos.longitude.toFixed(6);

      // Only highlight if we have previous values and they're different
      if (prevMyLat && prevMyLat !== newLat) {
        const latChanges = findChangedDigits(prevMyLat, newLat);
        setHighlightMyLat(latChanges);
        setTimeout(() => setHighlightMyLat([]), 400);
      }

      if (prevMyLng && prevMyLng !== newLng) {
        const lngChanges = findChangedDigits(prevMyLng, newLng);
        setHighlightMyLng(lngChanges);
        setTimeout(() => setHighlightMyLng([]), 400);
      }

      // Update coordinates and previous values
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

        // Only highlight if we have previous values and they're different
        if (prevOpponentLat && prevOpponentLat !== newLat) {
          const latChanges = findChangedDigits(prevOpponentLat, newLat);
          setHighlightOpponentLat(latChanges);
          setTimeout(() => setHighlightOpponentLat([]), 400);
        }

        if (prevOpponentLng && prevOpponentLng !== newLng) {
          const lngChanges = findChangedDigits(prevOpponentLng, newLng);
          setHighlightOpponentLng(lngChanges);
          setTimeout(() => setHighlightOpponentLng([]), 400);
        }

        // Update coordinates and previous values
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
      
      // Only highlight if we have a previous value and it's different
      if (prevDistance && prevDistance !== newDistance) {
        const distanceChanges = findChangedDigits(prevDistance, newDistance);
        setHighlightDistance(distanceChanges);
        setTimeout(() => setHighlightDistance([]), 400);
      }
      
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
          transition: 'all 0.4s ease',
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
          You are a {mode}
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
          renderHighlightedNumber={renderHighlightedNumber}
        />

        <LocationDisplay
          title={`${opponentMode.charAt(0).toUpperCase() + opponentMode.slice(1)}'s Location`}
          coordinates={opponentCoordinates}
          highlightLat={highlightOpponentLat}
          highlightLng={highlightOpponentLng}
          color={getModeColor(opponentMode)}
          renderHighlightedNumber={renderHighlightedNumber}
        />

        <DistanceDisplay
          distance={distance}
          highlightDistance={highlightDistance}
          renderHighlightedNumber={renderHighlightedNumber}
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
      </Paper>
    </Container>
  );
}; 