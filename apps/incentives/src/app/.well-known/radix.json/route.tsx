import { env } from '~/env';

export async function GET() {
  return new Response(
    JSON.stringify({
      dApps: [
        {
          dAppDefinitionAddress: env.NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS,
        },
      ],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
