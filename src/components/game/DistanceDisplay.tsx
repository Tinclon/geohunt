import { Box, Typography } from '@mui/material';
import type { DistanceDisplayProps } from './types';

const getDirection = (myCoords: { latitude: number; longitude: number }, opponentCoords: { latitude: number; longitude: number }): string => {
  const latDiff = opponentCoords.latitude - myCoords.latitude;
  const lngDiff = opponentCoords.longitude - myCoords.longitude;
  
  // Calculate angle in degrees
  const angle = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
  
  // Convert angle to cardinal direction
  const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
};

export const DistanceDisplay = ({ 
  distance, 
  highlightDistance, 
  renderHighlightedNumber, 
  theme,
  myCoordinates,
  opponentCoordinates,
  difficulty
}: DistanceDisplayProps) => {
  const direction = difficulty === 'Easy' && myCoordinates && opponentCoordinates
    ? getDirection(myCoordinates, opponentCoordinates)
    : null;

  const getArrowColor = () => {
    if (distance === null) return theme.palette.primary.main;
    if (distance <= 50) return theme.palette.error.main;
    if (distance <= 500) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" gutterBottom sx={{ color: theme.palette.primary.main }}>
        Distance
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body1" sx={{ 
          minWidth: '80px',
          fontFamily: '"Roboto Mono", "SF Mono", "Consolas", "Liberation Mono", "Menlo", "Courier", monospace'
        }}>
          {distance !== null ? (
            <>
              {renderHighlightedNumber(distance.toString(), highlightDistance)}
              &nbsp;meters
              {direction && (
                <Typography 
                  component="span" 
                  sx={{ 
                    ml: 3,
                    color: getArrowColor(),
                    fontFamily: '"Roboto Mono", "SF Mono", "Consolas", "Liberation Mono", "Menlo", "Courier", monospace',
                    fontSize: '1.2rem',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {direction}
                </Typography>
              )}
            </>
          ) : (
            'Unknown'
          )}
        </Typography>
      </Box>
    </Box>
  );
}; 