export default function MultiplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Multiplier Status</h2>
        <p className="text-muted-foreground">
          Your multiplier increases based on your XRD, LSU, and LSULP holdings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Current Multiplier</h3>
          <div className="text-4xl font-bold">1.5x</div>
          <p className="text-sm text-muted-foreground mt-2">
            Your current multiplier based on all combined holdings.
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Total Holdings</h3>
          <div className="text-4xl font-bold">$12,500</div>
          <p className="text-sm text-muted-foreground mt-2">
            Your combined XRD, LSU, and LSULP holdings in USD.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Holdings Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">XRD</span>
                <span className="text-sm font-medium">$8,200</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: '65.6%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">LSU</span>
                <span className="text-sm font-medium">$3,500</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: '28%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">LSULP</span>
                <span className="text-sm font-medium">$800</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: '6.4%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
