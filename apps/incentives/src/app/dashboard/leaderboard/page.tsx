'use client';

import { useEffect, useState } from 'react';
import { CategoryLeaderboard } from './components/category-leaderboard';
import { SeasonLeaderboard } from './components/season-leaderboard';

type TabType = 'category' | 'season';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('season');

  // Switch to activity points tab if coming from dashboard with category parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        setActiveTab('category');
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">Leaderboard</h2>
      </div>

      {/* Tab Navigation */}
      <div className="glass flex space-x-1 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setActiveTab('season')}
          className={`flex-1 rounded-lg px-4 py-3 font-medium text-sm transition-all duration-300 ${
            activeTab === 'season'
              ? 'glass-card gradient-brand text-white shadow-lg'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          Season Points
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('category')}
          className={`flex-1 rounded-lg px-4 py-3 font-medium text-sm transition-all duration-300 ${
            activeTab === 'category'
              ? 'glass-card gradient-brand text-white shadow-lg'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          Activity Points
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'season' && <SeasonLeaderboard />}
        {activeTab === 'category' && <CategoryLeaderboard />}
      </div>
    </div>
  );
}
