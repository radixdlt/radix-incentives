export const deduplicate = (items: string[]) => Array.from(new Set(items));

export const sort = (items: string[]) =>
  items.sort((a, b) => a.localeCompare(b));

export const flatten = (items: string[][]) => items.flat();
