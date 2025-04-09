"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Separator } from "~/components/ui/separator";

// Define Activity type based on activities.md structure
type Activity = {
  id: string;
  name: string;
  type: "Passive" | "Active";
  rewardType: "Points" | "Multiplier";
  // category?: string; // Could add later
};

// Mock data derived from activities.md
const mockActivities: Activity[] = [
  {
    id: "a1",
    name: "Holding XRD or Staking (LSUs)",
    type: "Passive",
    rewardType: "Multiplier",
  },
  {
    id: "a2",
    name: "Bridging/holding stable assets (xUSDC, xUSDT)",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a3",
    name: "Trading volume in bluechip volatiles (xBTC, xETH)",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a4",
    name: "Trading volume in stables (USDC, USDT)",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a5",
    name: "Trading volume in XRD",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a6",
    name: "Liquidity in bluechip volatiles",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a7",
    name: "Liquidity in stables",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a8",
    name: "Trading volume in (specific) Radix native assets",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a9",
    name: "Liquidity in (specific) Radix native assets",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a10",
    name: "Total DEX swaps of any types",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a11",
    name: "Lend XRD/LSU",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a12",
    name: "Lend stables",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a13",
    name: "Lend blue chip volatiles",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a14",
    name: "Borrow XRD/LSU",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a15",
    name: "Borrow stables",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a16",
    name: "Borrow blue chip volatiles",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a17",
    name: "Hold NFTs",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a18",
    name: "Trade NFT collections",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a19",
    name: "List NFTs",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a20",
    name: "Mint NFTs",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a21",
    name: "Hold specific tokens",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a22",
    name: "Hold multiple specific tokens",
    type: "Passive",
    rewardType: "Points",
  },
  {
    id: "a23",
    name: "Mint tokens",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a24",
    name: "Use specific dApps",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a25",
    name: "First time use specific dApps",
    type: "Active",
    rewardType: "Points",
  },
  {
    id: "a26",
    name: "Use multiple dApps",
    type: "Active",
    rewardType: "Points",
  },
];

function ManageActivitiesPage() {
  const router = useRouter();
  // TODO: Replace mockActivities with actual data fetching

  const handleRowClick = (activityId: string) => {
    router.push(`/activities/${activityId}/edit`);
  };

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Activities
            </h1>
            <p className="text-muted-foreground">
              Configure activities that participants can earn points or
              multipliers for.
            </p>
          </div>
        </div>
        {/* Wrap Button in Link and remove disabled attribute */}
        <Link href="/activities/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Activity
          </Button>
        </Link>
      </div>

      <Separator className="my-6" />

      {/* Activities Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reward Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockActivities.length > 0 ? (
              mockActivities.map((activity) => (
                <TableRow
                  key={activity.id}
                  onClick={() => handleRowClick(activity.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>{activity.type}</TableCell>
                  <TableCell>{activity.rewardType}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No activities defined yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ManageActivitiesPage;
