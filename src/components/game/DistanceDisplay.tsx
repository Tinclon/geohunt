import { Box, Typography } from '@mui/material';
import type { DistanceDisplayProps } from './types';

export const DistanceDisplay = ({ distance, highlightDistance, renderHighlightedNumber, theme }: DistanceDisplayProps) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h2" gutterBottom sx={{ color: theme.palette.common.white }}>
      Distance
    </Typography>
    <Typography 
      variant="body1"
      sx={{
        ...(!distance && { color: theme.palette.grey[500] }),
      }}
    >
      {distance !== null 
        ? (
          <>
            {renderHighlightedNumber(Math.round(distance).toString(), highlightDistance)}
            {' meters'}
          </>
        )
        : 'Unknown'}
    </Typography>
  </Box>
); 