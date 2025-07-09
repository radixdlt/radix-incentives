"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { SeasonLeaderboard } from "./components/season-leaderboard";
import { ActivityLeaderboard } from "./components/activity-leaderboard";

type TabType = "activity" | "season";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("season");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveTab("season")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "season"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Season Points
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "activity"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Activity Points
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "season" && <SeasonLeaderboard />}
        {activeTab === "activity" && <ActivityLeaderboard />}
      </div>
    </div>
  );
}
