import type { GameMode } from './types';

export const findChangedDigits = (oldStr: string, newStr: string): number[] => {
  const changes: number[] = [];
  
  // Ensure both strings are the same length by padding with zeros
  const maxLength = Math.max(oldStr.length, newStr.length);
  const paddedOld = oldStr.padEnd(maxLength, '0');
  const paddedNew = newStr.padEnd(maxLength, '0');
  
  // Compare each character and track changes
  for (let i = 0; i < maxLength; i++) {
    if (paddedOld[i] !== paddedNew[i]) {
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