import { Box, Typography, Container, Paper, IconButton, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const CoordinatesExplanation = ({ onBack }: { onBack: () => void }) => {
  const theme = useTheme();

  return (
    <Container maxWidth={false} sx={{ 
      pt: 4,
      width: '100%',
      height: '92vh',
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
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'auto'
        }}
      >
        <IconButton
          onClick={onBack}
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

        <Typography variant="h3" gutterBottom sx={{ 
          fontWeight: 'bold'
        }}>
          How Coordinates Work
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.primary.main }}>
          Latitude and Longitude: Earth's Grid System
        </Typography>

        <Typography variant="body1" paragraph>
          The Earth's coordinate system uses two numbers to pinpoint any location on the planet: latitude and longitude. 
          Think of it like a giant grid system that wraps around the Earth.
        </Typography>

        <Box 
          sx={{ 
            mt: 4, 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.success.main }}>
            Visual Guide
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 4,
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: theme.palette.warning.main }}>
                Latitude
              </Typography>
              <Box 
                component="img"
                src="latitude-diagram.svg"
                alt="Latitude lines running east-west around the Earth"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                }}
              />
              <Typography variant="body2" sx={{ mt: 2, color: theme.palette.grey[400] }}>
                Lines running east-west, measuring distance from the equator
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: theme.palette.info.main }}>
                Longitude
              </Typography>
              <Box 
                component="img"
                src="longitude-diagram.svg"
                alt="Longitude lines running north-south around the Earth"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                }}
              />
              <Typography variant="body2" sx={{ mt: 2, color: theme.palette.grey[400] }}>
                Lines running north-south, measuring distance from the prime meridian
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.error.main }}>
          Understanding the Numbers
        </Typography>

        <Typography variant="body1" paragraph>
          Latitude ranges from -90° to +90°:
        </Typography>
        <Typography variant="body1" paragraph>
          • 0° is the equator
          • +90° is the North Pole
          • -90° is the South Pole
        </Typography>

        <Typography variant="body1" paragraph>
          Longitude ranges from -180° to +180°:
        </Typography>
        <Typography variant="body1" paragraph>
          • 0° is the prime meridian (Greenwich, UK)
          • +180° and -180° meet at the International Date Line
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.info.main }}>
          Example Coordinates
        </Typography>

        <Typography variant="body1" paragraph>
          Vancouver: 49.2827, -123.1207
        </Typography>
        <Typography variant="body1" paragraph>
          Paris: 48.8566, 2.3522
        </Typography>
        <Typography variant="body1" paragraph>
          Creston: 49.0999, -116.5021
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.warning.main }}>
          Precision
        </Typography>

        <Typography variant="body1" paragraph>
          Each degree of latitude is approximately 111 kilometers (69 miles) apart. 
          Each degree of longitude varies in distance depending on latitude, as the lines converge at the poles.
        </Typography>

        <Typography variant="body1" paragraph>
          In our game, we use 6 decimal places for precision, which gives us accuracy to about 11 centimeters (4.3 inches)!
        </Typography>
      </Paper>
    </Container>
  );
}; 