export async function GET() {
  return new Response(
    JSON.stringify({
      dApps: [
        {
          dAppDefinitionAddress:
            'account_rdx129xqyvgkn9h73atyrzndal004fwye3tzw49kkygv9ltm2kyrv2lmda',
        },
      ],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
