export const toHex = (value: Uint8Array) =>
  Array.from(value)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
