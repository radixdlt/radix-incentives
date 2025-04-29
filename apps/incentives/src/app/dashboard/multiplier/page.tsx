export default function MultiplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Multiplier Status</h2>
        <p className="text-muted-foreground">
          Your multiplier increases based on your XRD, LSU, and LSULP holdings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Next Tier</h3>
          <div className="text-4xl font-bold">2.0x</div>
          <p className="text-sm text-muted-foreground mt-2">
            Add $7,500 more in holdings to reach the next multiplier tier.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Multiplier S-Curve</h3>
          <div className="h-64 flex items-end space-x-2">
            <div className="relative h-full flex-1">
              {/* S-curve visualization would be implemented here */}
              <div className="absolute inset-0 flex flex-col justify-end">
                <div
                  className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-md"
                  style={{ height: "40%" }}
                />
              </div>
              <div
                className="absolute h-8 w-8 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-background"
                style={{ left: "40%", bottom: "40%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <div>$0</div>
            <div>$25,000</div>
            <div>$50,000</div>
            <div>$75,000</div>
            <div>$100,000+</div>
          </div>
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
                  style={{ width: "65.6%" }}
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
                  style={{ width: "28%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">LSULP</span>
                <span className="text-sm font-medium">$800</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: "6.4%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Multiplier Calculator</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">XRD Amount</label>
              <input
                type="number"
                placeholder="0"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium">LSU Amount</label>
              <input
                type="number"
                placeholder="0"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium">LSULP Amount</label>
              <input
                type="number"
                placeholder="0"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
              >
                Calculate Multiplier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
