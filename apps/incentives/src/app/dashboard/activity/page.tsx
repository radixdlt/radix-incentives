export default function ActivityPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Activity History</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="appearance-none h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
              <option>All Activities</option>
              <option>DEX Trading</option>
              <option>Lending</option>
              <option>Borrowing</option>
              <option>Liquidity Provision</option>
              <option>Staking</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg
                className="h-4 w-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow">
        <div className="p-4">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">DEX Trading</div>
              <div className="text-sm text-muted-foreground">xUSDC → XRD</div>
            </div>
            <div className="text-right">
              <div className="font-medium">250 pts</div>
              <div className="text-sm text-muted-foreground">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-sm text-muted-foreground">2 hours ago</div>
            <div>
              <a href="#" className="text-sm text-primary hover:underline">
                View Tx
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">Liquidity Provision</div>
              <div className="text-sm text-muted-foreground">XRD-xUSDC LP</div>
            </div>
            <div className="text-right">
              <div className="font-medium">180 pts</div>
              <div className="text-sm text-muted-foreground">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-sm text-muted-foreground">5 hours ago</div>
            <div>
              <a href="#" className="text-sm text-primary hover:underline">
                View Tx
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">Lending</div>
              <div className="text-sm text-muted-foreground">Supplied XRD</div>
            </div>
            <div className="text-right">
              <div className="font-medium">120 pts</div>
              <div className="text-sm text-muted-foreground">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-sm text-muted-foreground">1 day ago</div>
            <div>
              <a href="#" className="text-sm text-primary hover:underline">
                View Tx
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">DEX Trading</div>
              <div className="text-sm text-muted-foreground">XRD → xUSDT</div>
            </div>
            <div className="text-right">
              <div className="font-medium">200 pts</div>
              <div className="text-sm text-muted-foreground">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-sm text-muted-foreground">2 days ago</div>
            <div>
              <a href="#" className="text-sm text-primary hover:underline">
                View Tx
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-4">
            <div>
              <div className="font-medium">Staking</div>
              <div className="text-sm text-muted-foreground">Staked XRD</div>
            </div>
            <div className="text-right">
              <div className="font-medium">150 pts</div>
              <div className="text-sm text-muted-foreground">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-sm text-muted-foreground">3 days ago</div>
            <div>
              <a href="#" className="text-sm text-primary hover:underline">
                View Tx
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            Previous
          </button>
          <div className="text-sm text-muted-foreground">Page 1 of 10</div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
