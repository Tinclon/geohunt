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
    return value.toFixed(6).replace(/\.?0+$/, '');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" gutterBottom sx={{ color }}>
        {title}
      </Typography>
      <Typography variant="body1">
        Latitude: {renderHighlightedNumber(formatCoordinate(coordinates.latitude), highlightLat)}
      </Typography>
      <Typography variant="body1">
        Longitude: {renderHighlightedNumber(formatCoordinate(coordinates.longitude), highlightLng)}
      </Typography>
    </Box>
  );
}; 