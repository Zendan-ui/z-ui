import type { KeyboardEvent } from 'react';

export function activateOnKey(
  handler: () => void,
  keys: string[] = ['Enter', ' '],
): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (keys.includes(e.key)) {
      e.preventDefault();
      handler();
    }
  };
}
