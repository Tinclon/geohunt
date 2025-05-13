import { Box, Typography, Container, Paper, IconButton, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const GPSExplanation = ({ onBack }: { onBack: () => void }) => {
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
          How GPS Works
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.primary.main }}>
          Trilateration: The Magic Behind GPS
        </Typography>

        <Typography variant="body1" paragraph>
          GPS (Global Positioning System) uses a technique called trilateration to determine your exact location on Earth. 
          Unlike triangulation, which uses angles, trilateration uses distances from known points to find your position.
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: '#6a0dad' }}>
          Trilateration vs. Triangulation
        </Typography>

        <Typography variant="body1" paragraph>
          While both methods are used for positioning, they work in fundamentally different ways:
        </Typography>

        <Typography variant="body1" paragraph>
          • <strong>Triangulation</strong> uses angles and at least two known points to determine a location. It's like 
          standing at a known point and measuring the angle to an unknown point, then doing the same from another known 
          point. The intersection of these angles gives you the location.
        </Typography>

        <Typography variant="body1" paragraph>
          • <strong>Trilateration</strong> uses distances from known points instead of angles. It's like knowing exactly 
          how far you are from three different landmarks. The intersection of these distance spheres gives you your exact 
          position. This is what GPS uses because it's more accurate for global positioning.
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
            Visual Comparison
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 4,
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: theme.palette.warning.main }}>
                Triangulation
              </Typography>
              <Box 
                component="img"
                src="triangulation-diagram.svg"
                alt="Triangulation diagram showing angle measurements"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                }}
              />
              <Typography variant="body2" sx={{ mt: 2, color: theme.palette.grey[400] }}>
                Using angles from known points to find location
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: theme.palette.info.main }}>
                Trilateration
              </Typography>
              <Box 
                component="img"
                src="trilateration-diagram.svg"
                alt="Trilateration diagram showing intersection of spheres"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                }}
              />
              <Typography variant="body2" sx={{ mt: 2, color: theme.palette.grey[400] }}>
                Using distances from known points to find location
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.error.main }}>
          The Process
        </Typography>

        <Typography variant="body1" paragraph>
          1. Your GPS receiver communicates with multiple satellites orbiting Earth
        </Typography>
        <Typography variant="body1" paragraph>
          2. Each satellite sends a signal containing its position and the exact time the signal was sent
        </Typography>
        <Typography variant="body1" paragraph>
          3. Your receiver calculates the distance to each satellite by measuring how long it took for the signals to arrive
        </Typography>
        <Typography variant="body1" paragraph>
          4. Using these distances, trilateration pinpoints your exact location
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.info.main }}>
          Understanding Trilateration
        </Typography>

        <Typography variant="body1" paragraph>
          Imagine you're somewhere on Earth, and you know you're exactly 10,000 kilometers from Satellite A. 
          This means you must be somewhere on a sphere with Satellite A at its center and a radius of 10,000 kilometers.
        </Typography>

        <Typography variant="body1" paragraph>
          Now, if you also know you're 12,000 kilometers from Satellite B, you must be somewhere on the intersection 
          of two spheres - a circle. This narrows down your possible locations significantly.
        </Typography>

        <Typography variant="body1" paragraph>
          Finally, if you know you're 15,000 kilometers from Satellite C, the intersection of all three spheres 
          gives you your exact location - a single point in space!
        </Typography>

        <Typography variant="h3" gutterBottom sx={{ mt: 4, color: theme.palette.warning.main }}>
          Why Three Satellites?
        </Typography>

        <Typography variant="body1" paragraph>
          While three satellites are theoretically enough to determine your position, GPS typically uses four or more 
          satellites for better accuracy. The extra satellites help account for timing errors and provide redundancy 
          in case one satellite's signal is blocked or weak.
        </Typography>
      </Paper>
    </Container>
  );
}; 