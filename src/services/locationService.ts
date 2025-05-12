import type { Coordinates } from '../components/game/types';

const SERVER_URL = import.meta.env.PROD 
  ? 'https://geohunt.onrender.com'  // Production server URL
  : 'http://localhost:3000';               // Development server URL

// Helper function to make API calls
const apiCall = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
  const response = await fetch(`${SERVER_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Store coordinates for a player
export const storeCoordinates = async (mode: string, coordinates: Coordinates): Promise<void> => {
  await apiCall(`/coordinates/${mode}`, 'POST', coordinates);
};

// Get coordinates for a player
export const getOpponentCoordinates = async (mode: string): Promise<Coordinates | null> => {
  try {
    return await apiCall(`/coordinates/${mode}`);
  } catch (error) {
    return null;
  }
};

export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};

export const watchPosition = (
  onSuccess: (coordinates: Coordinates) => void,
  onError: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    onError({
      code: 2,
      message: 'Geolocation is not supported by your browser',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    });
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    onError,
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}; 