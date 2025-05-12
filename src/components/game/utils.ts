import type { GameMode } from './types';

export const findChangedDigits = (oldStr: string, newStr: string): number[] => {
  const changes: number[] = [];
  let i = 0;
  let j = 0;
  
  // Find the first difference
  while (i < oldStr.length && j < newStr.length && oldStr[i] === newStr[j]) {
    i++;
    j++;
  }
  
  // If we found a difference, mark all characters from this point until the next matching character
  if (i < oldStr.length || j < newStr.length) {
    const startDiff = i;
    
    // Find where the strings match again
    while (i < oldStr.length && j < newStr.length && oldStr[i] !== newStr[j]) {
      i++;
      j++;
    }
    
    // Add all positions that changed
    for (let k = startDiff; k < i; k++) {
      changes.push(k);
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