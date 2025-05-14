export type GameRole = 'hawk' | 'bluebird' | 'falcon' | 'starling';
export type Difficulty = 'Extreme' | 'Hard' | 'Medium' | 'Easy';

export interface Coordinates {
  latitude: number;
  longitude: number;
  difficulty?: Difficulty;
}

export interface LocationDisplayProps {
  title: string;
  coordinates: { latitude: string; longitude: string; } | null;
  highlightLat: number[];
  highlightLng: number[];
  color: string;
  renderHighlightedNumber: (value: string, highlights: number[]) => React.ReactNode[];
  prevCoordinates: { latitude: string; longitude: string; } | null;
  difficulty: Difficulty;
}

export interface DistanceDisplayProps {
  distance: number | null;
  highlightDistance: number[];
  renderHighlightedNumber: (value: string, highlights: number[]) => React.ReactNode[];
  theme: any;
  myCoordinates: Coordinates | null;
  opponentCoordinates: Coordinates | null;
  difficulty: Difficulty;
}

export interface RoleSelectionProps {
  onRoleSelect: (role: GameRole) => void;
  onGPSExplanationClick: () => void;
  onCoordinatesExplanationClick: () => void;
  onViewerClick: () => void;
  theme: any;
} 