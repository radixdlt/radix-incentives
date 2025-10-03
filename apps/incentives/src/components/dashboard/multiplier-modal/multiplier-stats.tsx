'use client';

type MultiplierStatsProps = {
  multiplier: number;
  xrdAmount: number;
};

export const MultiplierStats = ({
  multiplier,
  xrdAmount,
}: MultiplierStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="text-center">
          <div className="gradient-text font-bold text-4xl text-white tracking-tight">
            {multiplier.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-sm">
            Current Multiplier
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="text-center">
          <div className="gradient-text font-bold text-4xl text-white tracking-tight">
            {xrdAmount.toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}
            <span className="ml-2 font-medium text-2xl text-muted-foreground">
              XRD
            </span>
          </div>
          <div className="text-muted-foreground text-sm">Average Holdings</div>
        </div>
      </div>
    </div>
  );
};
