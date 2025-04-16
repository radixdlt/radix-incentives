export default function AccountsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Account Management
        </h2>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          Connect New Account
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium">Connected Accounts</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your connected Radix accounts and verify ownership.
          </p>
        </div>

        <div className="border-t">
          <div className="divide-y">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <title>Account</title>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">account_ab...z21</div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <title>Account</title>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">account_cd...f42</div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    Verify Account
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Account Linking Instructions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Follow these steps to link additional accounts to your dashboard:
          </p>

          <ol className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                1
              </span>
              <span className="pt-0.5">
                Click the "Connect New Account" button above.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                2
              </span>
              <span className="pt-0.5">
                Connect your Radix wallet and select the account to link.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                3
              </span>
              <span className="pt-0.5">
                Sign the verification message to prove account ownership.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                4
              </span>
              <span className="pt-0.5">
                Your account will now be linked and start earning points.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
