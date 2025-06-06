import { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const getDirectionSymbol = (degrees: number): string => {
  // Normalize degrees to 0-360
  const normalized = (degrees + 360) % 360;
  
  // Map degrees to cardinal directions
  if (normalized >= 337.5 || normalized < 22.5) return '↑';  // North
  if (normalized >= 22.5 && normalized < 67.5) return '↗';   // Northeast
  if (normalized >= 67.5 && normalized < 112.5) return '→';  // East
  if (normalized >= 112.5 && normalized < 157.5) return '↘'; // Southeast
  if (normalized >= 157.5 && normalized < 202.5) return '↓'; // South
  if (normalized >= 202.5 && normalized < 247.5) return '↙'; // Southwest
  if (normalized >= 247.5 && normalized < 292.5) return '←'; // West
  if (normalized >= 292.5 && normalized < 337.5) return '↖'; // Northwest
  
  return '↑'; // Default to North
};

export const CompassIndicator = () => {
  const theme = useTheme();
  const [direction, setDirection] = useState<string>('↑');
  const [degrees, setDegrees] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use webkitCompassHeading if available (iOS devices)
      if ('webkitCompassHeading' in event) {
        const heading = (event as any).webkitCompassHeading;
        setDegrees(heading);
        setDirection(getDirectionSymbol(heading));
        setError(null);
      } else {
        // Fallback to device orientation for non-iOS devices
        const alpha = event.alpha;
        if (alpha !== null) {
          setDegrees(alpha);
          setDirection(getDirectionSymbol(alpha));
          setError(null);
        }
      }
    };

    const checkPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            intervalId = window.setInterval(() => {
              // Force a re-render every second
              setDirection(prev => prev);
            }, 1000);
          } else {
            setError('Permission denied');
          }
        } catch (error) {
          setError('Error requesting permission');
        }
      } else {
        // For browsers that don't require permission
        window.addEventListener('deviceorientation', handleOrientation);
        intervalId = window.setInterval(() => {
          setDirection(prev => prev);
        }, 1000);
      }
    };

    checkPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 96,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {/* North label */}
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.primary.main,
          textShadow: `0 0 5px ${theme.palette.primary.main}`,
          fontSize: '0.75rem',
        }}
      >
        N
      </Typography>
      
      {/* Middle row with West, Compass, East */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.primary.main,
            textShadow: `0 0 5px ${theme.palette.primary.main}`,
            fontSize: '0.75rem',
          }}
        >
          W
        </Typography>
        
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.primary.main,
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
              fontFamily: 'monospace',
            }}
          >
            {error ? '?' : direction}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: theme.palette.primary.main,
            textShadow: `0 0 5px ${theme.palette.primary.main}`,
            fontSize: '0.75rem',
          }}
        >
          E
        </Typography>
      </Box>

      {/* South label */}
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.primary.main,
          textShadow: `0 0 5px ${theme.palette.primary.main}`,
          fontSize: '0.75rem',
        }}
      >
        S
      </Typography>

      {/* Degrees display */}
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.primary.main,
          textShadow: `0 0 5px ${theme.palette.primary.main}`,
          fontSize: '0.75rem',
          mt: 0.5,
          fontFamily: 'monospace',
        }}
      >
        {error ? '---' : `${Math.round(degrees)}°`}
      </Typography>
    </Box>
  );
}; 