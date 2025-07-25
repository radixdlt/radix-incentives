"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { SeasonLeaderboard } from "./components/season-leaderboard";
import { CategoryLeaderboard } from "./components/category-leaderboard";

type TabType = "category" | "season";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("season");
  const searchParams = useSearchParams();

  // Switch to activity points tab if coming from dashboard with category parameter
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setActiveTab("category");
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 glass rounded-xl p-1">
        <button
          type="button"
          onClick={() => setActiveTab("season")}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === "season"
              ? "glass-card text-white shadow-lg gradient-brand"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Season Points
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("category")}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === "category"
              ? "glass-card text-white shadow-lg gradient-brand"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Activity Points
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "season" && <SeasonLeaderboard />}
        {activeTab === "category" && <CategoryLeaderboard />}
      </div>
    </div>
  );
}
