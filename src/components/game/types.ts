export type GameMode = 'hawk' | 'bluebird' | 'falcon' | 'starling';

export interface Coordinates {
  latitude: number;
  longitude: number;
  difficulty?: 'Hard' | 'Medium' | 'Easy';
}

export interface LocationDisplayProps {
  title: string;
  coordinates: Coordinates | null;
  highlightLat: number[];
  highlightLng: number[];
  color: string;
  renderHighlightedNumber: (value: string, highlights: number[]) => React.ReactNode[];
  prevCoordinates: Coordinates | null;
  difficulty: 'Hard' | 'Medium' | 'Easy';
}

export interface DistanceDisplayProps {
  distance: number | null;
  highlightDistance: number[];
  renderHighlightedNumber: (value: string, highlights: number[]) => React.ReactNode[];
  theme: any;
  myCoordinates: Coordinates | null;
  opponentCoordinates: Coordinates | null;
  difficulty: 'Hard' | 'Medium' | 'Easy';
}

export interface ModeSelectionProps {
  onModeSelect: (mode: GameMode) => void;
  onGPSExplanationClick: () => void;
  onCoordinatesExplanationClick: () => void;
  theme: any;
} 