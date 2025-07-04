export async function GET() {
  return new Response(
    JSON.stringify({
      dApps: [
        {
          dAppDefinitionAddress:
            'account_rdx129zzrj4mwjwec8e6rmsvcz0hx4lp7uj3kf73w8rd2fek4cryaemewh',
        },
      ],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
