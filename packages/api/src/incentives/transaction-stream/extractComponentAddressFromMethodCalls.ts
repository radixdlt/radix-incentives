export const extractComponentAddressFromMethodCalls = (
  manifest: string
): string[] => {
  const regex = /Address\("(component_rdx1[a-z0-9]+)"\)/g;

  return [
    ...new Set(Array.from(manifest.matchAll(regex), (match) => match[1])),
  ];
};
