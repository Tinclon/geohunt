import type { GameMode } from './types';

export const findChangedDigits = (oldStr: string, newStr: string, shouldPad: boolean = false): number[] => {
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