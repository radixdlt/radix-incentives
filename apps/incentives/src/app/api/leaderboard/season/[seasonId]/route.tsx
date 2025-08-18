import { createDependencyLayer } from 'api/incentives';
import { db } from 'db/incentives';
import { Exit } from 'effect';
import { z } from 'zod';

const GetSeasonLeaderboardPaginatedInputSchema = z.object({
  seasonId: z.string().uuid({ message: 'seasonId must be a valid UUID v4' }),
  page: z.number().optional().default(0),
  limit: z.number().optional().default(100),
});

export async function GET(
  request: Request,
  { params }: { params: { seasonId: string } },
) {
  const dependencyLayer = createDependencyLayer({
    dbClient: db,
  });

  const seasonId = params.seasonId;
  const url = new URL(request.url);
  const page = url.searchParams.get('page')
    ? parseInt(url.searchParams.get('page') ?? '0')
    : undefined;
  const limit = url.searchParams.get('limit')
    ? parseInt(url.searchParams.get('limit') ?? '100')
    : undefined;

  const parsedResult = GetSeasonLeaderboardPaginatedInputSchema.safeParse({
    seasonId,
    page,
    limit,
  });

  if (!parsedResult.success) {
    const flattened = parsedResult.error.flatten();

    return new Response(JSON.stringify({ error: flattened.fieldErrors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await dependencyLayer.getSeasonLeaderboardPaginated(
    parsedResult.data,
  );

  const output = Exit.match(result, {
    onSuccess: (value) =>
      new Response(JSON.stringify(value), {
        headers: { 'Content-Type': 'application/json' },
      }),
    onFailure: (error) => {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return output;
}
