import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import type { LocationDisplayProps } from './types';

export const LocationDisplay = ({ 
  title, 
  coordinates, 
  highlightLat, 
  highlightLng, 
  color, 
  renderHighlightedNumber,
  prevCoordinates,
  difficulty
}: LocationDisplayProps) => {
  const theme = useTheme();
  const isPortrait = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isPortrait ? 'column' : 'row',
        gap: isPortrait ? 0.5 : 2, 
        alignItems: isPortrait ? 'flex-start' : 'center'
      }}>
        <Typography variant="body1" sx={{ 
          minWidth: isPortrait ? 'auto' : '80px',
          fontFamily: monospaceFont
        }}>
          Latitude:&nbsp;
        </Typography>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          pl: isPortrait ? 2 : 0
        }}>
          <Typography variant="body1" sx={{ 
            fontFamily: monospaceFont,
            minWidth: isPortrait ? 'auto' : '120px',
            textAlign: isPortrait ? 'left' : 'right'
          }}>
            {renderHighlightedNumber(coordinates.latitude, highlightLat)}
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
      </Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isPortrait ? 'column' : 'row',
        gap: isPortrait ? 0.5 : 2, 
        alignItems: isPortrait ? 'flex-start' : 'center'
      }}>
        <Typography variant="body1" sx={{ 
          minWidth: isPortrait ? 'auto' : '80px',
          fontFamily: monospaceFont
        }}>
          Longitude:
        </Typography>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          pl: isPortrait ? 2 : 0
        }}>
          <Typography variant="body1" sx={{ 
            fontFamily: monospaceFont,
            minWidth: isPortrait ? 'auto' : '120px',
            textAlign: isPortrait ? 'left' : 'right'
          }}>
            {renderHighlightedNumber(coordinates.longitude, highlightLng)}
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
    </Box>
  );
}; 