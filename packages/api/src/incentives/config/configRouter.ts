import { createTRPCRouter, publicProcedure } from "../trpc";

const PUBLIC_ENVIRONMENT_VARIABLES = {
  NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED: process.env
    .NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED
    ? new Date(process.env.NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED)
    : null,
} as const;

export const configRouter = createTRPCRouter({
  getPublicConfig: publicProcedure.query(async () => {
    return PUBLIC_ENVIRONMENT_VARIABLES;
  }),
});
