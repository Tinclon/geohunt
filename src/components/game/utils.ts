import type { GameMode } from './types';

export type CoordinateSystem = 'decimal' | 'dms';

export interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

export const decimalToDMS = (decimal: number, isLatitude: boolean): DMS => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  return {
    degrees,
    minutes,
    seconds,
    direction: isLatitude 
      ? decimal >= 0 ? 'N' : 'S'
      : decimal >= 0 ? 'E' : 'W'
  };
};

export const formatDMS = (dms: DMS): string => {
  const degrees = dms.degrees.toString().padStart(3, '\u00A0');
  const minutes = dms.minutes.toString().padStart(2, '\u00A0');
  const seconds = dms.seconds.toFixed(4).padStart(8, '\u00A0'); // 8 chars to account for decimal point and 4 decimal places
  return `${degrees}°${minutes}'${seconds}" ${dms.direction}`;
};

export const findChangedChars = (oldStr: string, newStr: string): number[] => {

  const changes: number[] = [];
  const maxLength = Math.max(oldStr.length, newStr.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (oldStr[i] !== newStr[i]) {
      changes.push(i);
    }
  }
  
  return changes;
};

export const getOpponentMode = (currentMode: GameMode): GameMode => {
  switch (currentMode) {
    case 'hawk':
      return 'bluebird';
    case 'bluebird':
      return 'hawk';
    case 'falcon':
      return 'starling';
    case 'starling':
      return 'falcon';
  }
}; 