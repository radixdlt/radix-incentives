import { createDependencyLayer } from 'api/incentives';
import { db } from 'db/incentives';
import { Exit } from 'effect';

export async function GET(_: Request) {
  const dependencyLayer = createDependencyLayer({
    dbClient: db,
  });

  const result = await dependencyLayer.getIncentivesData();

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
