export default function MultiplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">Multiplier Status</h2>
        <p className="text-muted-foreground">
          Your multiplier increases based on your XRD, LSU, and LSULP holdings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="mb-2 font-medium text-lg">Current Multiplier</h3>
          <div className="font-bold text-4xl">1.5x</div>
          <p className="mt-2 text-muted-foreground text-sm">
            Your current multiplier based on all combined holdings.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="mb-2 font-medium text-lg">Total Holdings</h3>
          <div className="font-bold text-4xl">$12,500</div>
          <p className="mt-2 text-muted-foreground text-sm">
            Your combined XRD, LSU, and LSULP holdings in USD.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="mb-4 font-medium text-lg">Holdings Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="font-medium text-sm">XRD</span>
                <span className="font-medium text-sm">$8,200</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: '65.6%' }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <span className="font-medium text-sm">LSU</span>
                <span className="font-medium text-sm">$3,500</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: '28%' }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <span className="font-medium text-sm">LSULP</span>
                <span className="font-medium text-sm">$800</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-pink-500" style={{ width: '6.4%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
