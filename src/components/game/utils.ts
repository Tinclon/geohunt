import type { GameMode } from './types';

export const findChangedDigits = (oldStr: string, newStr: string): number[] => {
  const changes: number[] = [];
  
  // Split the strings at the decimal point
  const [oldWhole, oldDecimal = ''] = oldStr.split('.');
  const [newWhole, newDecimal = ''] = newStr.split('.');
  
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