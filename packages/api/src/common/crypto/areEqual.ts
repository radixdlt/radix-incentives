/**
 * Compares two Uint8Array instances for equality.
 * @param a The first Uint8Array.
 * @param b The second Uint8Array.
 * @returns True if the arrays have the same length and content, false otherwise.
 */
export const areUint8ArraysEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};
