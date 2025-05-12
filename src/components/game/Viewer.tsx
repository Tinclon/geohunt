import { useState, useEffect } from 'react';
import { Typography, Container, Paper, useTheme, IconButton, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getOpponentCoordinates, calculateDistance } from '../../services/locationService';
import type { Coordinates } from './types';
import { formatDMS, decimalToDMS } from './utils';
import type { CoordinateSystem } from './utils';

type Role = 'hawk' | 'bluebird' | 'falcon' | 'starling';

interface RoleData {
  coordinates: Coordinates | null;
  formattedCoordinates: {
    latitude: string;
    longitude: string;
  } | null;
}

export const Viewer = ({ onBack }: { onBack: () => void }) => {
  const theme = useTheme();
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem>(() => {
    const saved = localStorage.getItem('coordinateSystem');
    return (saved === 'decimal' || saved === 'dms') ? saved as CoordinateSystem : 'decimal';
  });
  const [roleData, setRoleData] = useState<Record<Role, RoleData>>({
    hawk: { coordinates: null, formattedCoordinates: null },
    bluebird: { coordinates: null, formattedCoordinates: null },
    falcon: { coordinates: null, formattedCoordinates: null },
    starling: { coordinates: null, formattedCoordinates: null }
  });

  const formatCoordinate = (value: number, isLatitude: boolean) => {
    if (coordinateSystem === 'decimal') {
      const formatted = value.toFixed(6).replace(/\.?0+$/, '');
      // Pad the integer part for consistent comparison
      const [intPart, decPart] = formatted.split('.');
      const paddedInt = intPart.padStart(4, '\u00A0'); // Using non-breaking space
      const paddedDec = decPart && decPart.padEnd(6, '0');
      return paddedDec ? `${paddedInt}.${paddedDec}` : paddedInt;
    } else {
      const dms = decimalToDMS(value, isLatitude);
      return formatDMS(dms);
    }
  };

  const handleCoordinateSystemChange = () => {
    const newSystem = coordinateSystem === 'decimal' ? 'dms' : 'decimal';
    setCoordinateSystem(newSystem);
    localStorage.setItem('coordinateSystem', newSystem);
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'hawk':
        return theme.palette.error.main;
      case 'bluebird':
        return theme.palette.info.main;
      case 'falcon':
        return theme.palette.warning.main;
      case 'starling':
        return theme.palette.success.main;
    }
  };

  const updateRoleLocations = async () => {
    const roles: Role[] = ['hawk', 'bluebird', 'falcon', 'starling'];
    
    for (const role of roles) {
      try {
        const coordinates = await getOpponentCoordinates(role);
        if (coordinates) {
          setRoleData(prev => ({
            ...prev,
            [role]: {
              coordinates,
              formattedCoordinates: {
                latitude: formatCoordinate(coordinates.latitude, true),
                longitude: formatCoordinate(coordinates.longitude, false)
              }
            }
          }));
        }
      } catch (error) {
        console.error(`Error fetching ${role} coordinates:`, error);
      }
    }
  };

  useEffect(() => {
    updateRoleLocations();
    const interval = setInterval(updateRoleLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update formatted coordinates when coordinate system changes
  useEffect(() => {
    const roles: Role[] = ['hawk', 'bluebird', 'falcon', 'starling'];
    setRoleData(prev => {
      const newData = { ...prev };
      for (const role of roles) {
        if (prev[role].coordinates) {
          newData[role] = {
            ...prev[role],
            formattedCoordinates: {
              latitude: formatCoordinate(prev[role].coordinates!.latitude, true),
              longitude: formatCoordinate(prev[role].coordinates!.longitude, false)
            }
          };
        }
      }
      return newData;
    });
  }, [coordinateSystem]);

  const calculateDistanceBetween = (role1: Role, role2: Role) => {
    const coords1 = roleData[role1].coordinates;
    const coords2 = roleData[role2].coordinates;
    if (coords1 && coords2) {
      return Math.round(calculateDistance(coords1, coords2));
    }
    return null;
  };

  const renderRoleBox = (role: Role) => {
    const data = roleData[role];
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: `2px solid ${getRoleColor(role)}`,
          borderRadius: 2,
          minWidth: 200,
        }}
      >
        <Typography variant="h6" sx={{ color: getRoleColor(role), mb: 1 }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Typography>
        {data.formattedCoordinates ? (
          <>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              Lat: {data.formattedCoordinates.latitude}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              Lng: {data.formattedCoordinates.longitude}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No location data
          </Typography>
        )}
      </Paper>
    );
  };

  const renderDistance = (role1: Role, role2: Role) => {
    const distance = calculateDistanceBetween(role1, role2);
    return (
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'monospace',
          color: 'text.secondary',
          textAlign: 'center',
        }}
      >
        {distance !== null ? `${distance} meters` : 'N/A'}
      </Typography>
    );
  };

  return (
    <Container maxWidth={false} sx={{ 
      pt: 2,
      pb: 2,
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
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

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 3, md: 4 }
        }}>
          <Typography 
            variant="h1" 
            gutterBottom
            sx={{
              color: '#6a0dad',
              pr: 6,
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }
            }}
          >
            Owl
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr auto 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto auto auto auto',
            sm: '1fr 1fr'
          },
          gap: { xs: 2, sm: 3, md: 4 },
          alignItems: 'center',
          justifyItems: 'center',
          mb: { xs: 4, sm: 6, md: 8 },
          '& > *:nth-of-type(3)': {
            mb: { xs: 4, sm: 0 }
          }
        }}>
          {/* First pair */}
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 250, md: 300 } }}>{renderRoleBox('hawk')}</Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'column' }, 
            gap: 2,
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            {renderDistance('hawk', 'bluebird')}
          </Box>
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 250, md: 300 } }}>{renderRoleBox('bluebird')}</Box>

          {/* Second pair */}
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 250, md: 300 } }}>{renderRoleBox('falcon')}</Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'column' }, 
            gap: 2,
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            {renderDistance('falcon', 'starling')}
          </Box>
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 250, md: 300 } }}>{renderRoleBox('starling')}</Box>
        </Box>

        <Box sx={{ 
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          mb: { xs: 2, sm: 3 }
        }}>
          <Button
            variant="contained"
            onClick={handleCoordinateSystemChange}
            sx={{ 
              minWidth: 90,
              bgcolor: 'grey.700',
              '&:hover': {
                bgcolor: 'grey.600',
              },
              color: 'grey.300',
              py: { xs: 1, sm: 1.5, md: 2 }
            }}
          >
            {coordinateSystem === 'decimal' ? 'Decimal' : 'DMS'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}; 