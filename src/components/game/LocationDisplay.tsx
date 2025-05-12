import { Box, Typography } from '@mui/material';
import type { LocationDisplayProps } from './types';

export const LocationDisplay = ({ title, coordinates, highlightLat, highlightLng, color, renderHighlightedNumber }: LocationDisplayProps) => {
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

  const formatCoordinate = (value: number) => {
    return value.toFixed(6);
  };

  const monospaceFont = '"Roboto Mono", "SF Mono", "Consolas", "Liberation Mono", "Menlo", "Courier", monospace';

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" gutterBottom sx={{ color }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
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
          {renderHighlightedNumber(formatCoordinate(coordinates.latitude), highlightLat)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
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
          {renderHighlightedNumber(formatCoordinate(coordinates.longitude), highlightLng)}
        </Typography>
      </Box>
    </Box>
  );
}; 