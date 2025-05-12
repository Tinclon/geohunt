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

export const findChangedDigitsDecimal = (oldStr: string, newStr: string, shouldPad: boolean = false): number[] => {
  const changes: number[] = [];
  
  let oldValue = oldStr;
  let newValue = newStr;
  
  if (shouldPad) {
    const [oldInt, oldDec] = oldStr.split('.');
    const [newInt, newDec] = newStr.split('.');
    const oldPadded = oldInt.padStart(4, '\u00A0');
    const newPadded = newInt.padStart(4, '\u00A0');
    oldValue = oldDec ? `${oldPadded}.${oldDec}` : oldPadded;
    newValue = newDec ? `${newPadded}.${newDec}` : newPadded;
  }
  
  // Split the strings at the decimal point
  const [oldWhole, oldDecimal = ''] = oldValue.split('.');
  const [newWhole, newDecimal = ''] = newValue.split('.');
  
  // Compare whole numbers from right to left
  const maxWholeLength = Math.max(oldWhole.length, newWhole.length);
  const paddedOldWhole = oldWhole.padStart(maxWholeLength, '0');
  const paddedNewWhole = newWhole.padStart(maxWholeLength, '0');
  
  for (let i = 0; i < maxWholeLength; i++) {
    if (paddedOldWhole[i] !== paddedNewWhole[i]) {
      changes.push(i);
    }
  }
  
  // Compare decimal numbers from left to right
  const maxDecimalLength = Math.max(oldDecimal.length, newDecimal.length);
  const paddedOldDecimal = oldDecimal.padEnd(maxDecimalLength, '0');
  const paddedNewDecimal = newDecimal.padEnd(maxDecimalLength, '0');
  
  for (let i = 0; i < maxDecimalLength; i++) {
    if (paddedOldDecimal[i] !== paddedNewDecimal[i]) {
      changes.push(maxWholeLength + 1 + i); // +1 for the decimal point
    }
  }
  
  return changes;
};

export const findChangedDMS = (prev: string, curr: string): number[] => {
  // Split the DMS string into its components (degrees, minutes, seconds, direction)
  const prevMatch = prev.match(/(\d+)°\s*(\d+)'\s*(\d+)"\s*([NSEW])/);
  const currMatch = curr.match(/(\d+)°\s*(\d+)'\s*(\d+)"\s*([NSEW])/);
  
  if (!prevMatch || !currMatch) return [];
  
  const [, prevDeg, prevMin, prevSec] = prevMatch;
  const [, currDeg, currMin, currSec] = currMatch;
  
  const changes: number[] = [];
  let charIndex = 0;
  
  // Compare degrees
  for (let i = 0; i < Math.max(prevDeg.length, currDeg.length); i++) {
    if (prevDeg[i] !== currDeg[i]) {
      changes.push(charIndex + i);
    }
  }
  charIndex += prevDeg.length + 2; // +2 for "° "
  
  // Compare minutes
  for (let i = 0; i < Math.max(prevMin.length, currMin.length); i++) {
    if (prevMin[i] !== currMin[i]) {
      changes.push(charIndex + i);
    }
  }
  charIndex += prevMin.length + 2; // +2 for "' "
  
  // Compare seconds
  for (let i = 0; i < Math.max(prevSec.length, currSec.length); i++) {
    if (prevSec[i] !== currSec[i]) {
      changes.push(charIndex + i);
    }
  }
  charIndex += prevSec.length + 2; // +2 for '" '
  
  // Direction changes are not highlighted
  
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