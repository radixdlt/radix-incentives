export async function GET() {
  return new Response(
    JSON.stringify({
      dApps: [
        {
          dAppDefinitionAddress:
            'account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k',
        },
      ],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
