export default function ActivityPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl tracking-tight">Activity History</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
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
                role="img"
                aria-label="Dropdown arrow"
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
              <div className="text-muted-foreground text-sm">xUSDC → XRD</div>
            </div>
            <div className="text-right">
              <div className="font-medium">250 pts</div>
              <div className="text-muted-foreground text-sm">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-muted-foreground text-sm">2 hours ago</div>
            <div>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                View Tx
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">Liquidity Provision</div>
              <div className="text-muted-foreground text-sm">XRD-xUSDC LP</div>
            </div>
            <div className="text-right">
              <div className="font-medium">180 pts</div>
              <div className="text-muted-foreground text-sm">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-muted-foreground text-sm">5 hours ago</div>
            <div>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                View Tx
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">Lending</div>
              <div className="text-muted-foreground text-sm">Supplied XRD</div>
            </div>
            <div className="text-right">
              <div className="font-medium">120 pts</div>
              <div className="text-muted-foreground text-sm">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-muted-foreground text-sm">1 day ago</div>
            <div>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                View Tx
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b py-4">
            <div>
              <div className="font-medium">DEX Trading</div>
              <div className="text-muted-foreground text-sm">XRD → xUSDT</div>
            </div>
            <div className="text-right">
              <div className="font-medium">200 pts</div>
              <div className="text-muted-foreground text-sm">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-muted-foreground text-sm">2 days ago</div>
            <div>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                View Tx
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-4">
            <div>
              <div className="font-medium">Staking</div>
              <div className="text-muted-foreground text-sm">Staked XRD</div>
            </div>
            <div className="text-right">
              <div className="font-medium">150 pts</div>
              <div className="text-muted-foreground text-sm">
                +1.5x multiplier
              </div>
            </div>
            <div className="text-muted-foreground text-sm">3 days ago</div>
            <div>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                View Tx
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t p-4">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-muted-foreground text-sm">Page 1 of 10</div>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
