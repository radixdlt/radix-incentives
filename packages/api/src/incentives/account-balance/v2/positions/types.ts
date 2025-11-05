export const PositionKey = {
  lsulp: 'lsulp',
  unstaked: 'unstaked',
  lsu: 'lsu',
} as const;

export type PositionKey = (typeof PositionKey)[keyof typeof PositionKey];
