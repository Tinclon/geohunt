import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocationDisplayProps } from './types';

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

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" gutterBottom sx={{ color }}>
        {title}
      </Typography>
      <Typography variant="body1">
        Latitude: {renderHighlightedNumber(coordinates.latitude.toFixed(6), highlightLat)}
      </Typography>
      <Typography variant="body1">
        Longitude: {renderHighlightedNumber(coordinates.longitude.toFixed(6), highlightLng)}
      </Typography>
    </Box>
  );
}; 