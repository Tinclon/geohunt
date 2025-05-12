import { Box, Typography } from '@mui/material';
import type { LocationDisplayProps } from './types';
import { decimalToDMS, formatDMS } from './utils';

export const LocationDisplay = ({ 
  title, 
  coordinates, 
  highlightLat, 
  highlightLng, 
  color, 
  renderHighlightedNumber,
  prevCoordinates,
  difficulty,
  coordinateSystem
}: LocationDisplayProps) => {
  if (!coordinates) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" gutterBottom sx={{ color }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.500' }}>
          Unknown
        </Typography>
      </Box>
    );
  }

  const formatCoordinate = (value: number, isLatitude: boolean) => {
    if (coordinateSystem === 'decimal') {
      return value.toFixed(6);
    } else {
      const dms = decimalToDMS(value, isLatitude);
      return formatDMS(dms);
    }
  };

  const monospaceFont = '"Roboto Mono", "SF Mono", "Consolas", "Liberation Mono", "Menlo", "Courier", monospace';

  const showDirection = difficulty !== 'Hard' && prevCoordinates;
  const latDirection = showDirection && prevCoordinates.latitude !== coordinates.latitude
    ? coordinates.latitude > prevCoordinates.latitude ? '↑' : '↓'
    : null;
  const lngDirection = showDirection && prevCoordinates.longitude !== coordinates.longitude
    ? coordinates.longitude > prevCoordinates.longitude ? '→' : '←'
    : null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" gutterBottom sx={{ color }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body1" sx={{ 
          minWidth: '80px',
          fontFamily: monospaceFont
        }}>
          Latitude:&nbsp;
        </Typography>
        <Typography variant="body1" sx={{ 
          fontFamily: monospaceFont,
          minWidth: '120px',
          textAlign: 'right'
        }}>
          {renderHighlightedNumber(formatCoordinate(coordinates.latitude, true), highlightLat)}
        </Typography>
        {latDirection && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'primary.main',
              opacity: highlightLat.length > 0 ? 1 : 0,
              transition: 'opacity 0.4s ease',
              ml: 1,
              fontFamily: monospaceFont,
              fontSize: '1.2rem'
            }}
          >
            {latDirection}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body1" sx={{ 
          minWidth: '80px',
          fontFamily: monospaceFont
        }}>
          Longitude:
        </Typography>
        <Typography variant="body1" sx={{ 
          fontFamily: monospaceFont,
          minWidth: '120px',
          textAlign: 'right'
        }}>
          {renderHighlightedNumber(formatCoordinate(coordinates.longitude, false), highlightLng)}
        </Typography>
        {lngDirection && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'primary.main',
              opacity: highlightLng.length > 0 ? 1 : 0,
              transition: 'opacity 0.4s ease',
              ml: 1,
              fontFamily: monospaceFont,
              fontSize: '1.2rem'
            }}
          >
            {lngDirection}
          </Typography>
        )}
      </Box>
    </Box>
  );
}; 