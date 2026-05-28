'use client';

import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { useLanguage } from '@/components/LanguageProvider';
import { Trophy } from 'lucide-react';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  criteriaType: string;
  criteriaValue: number;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: { current: number; target: number };
};

type AchievementsPayload = {
  achievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
};

export default function AchievementsGrid() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => userAPI.getAchievements(),
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const payload: AchievementsPayload | undefined = data?.data?.data;
  if (!payload) return null;

  const { achievements, totalPoints, unlockedCount, totalCount } = payload;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.achievementsTitle') || 'Achievements'}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-500">{totalPoints}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('dashboard.points') || 'points'} · {unlockedCount}/{totalCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((a) => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({ achievement: a }: { achievement: Achievement }) {
  const pct = a.progress.target > 0
    ? Math.min(100, Math.round((a.progress.current / a.progress.target) * 100))
    : 0;

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all ${
        a.unlocked
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75'
      }`}
    >
      <div className={`text-4xl mb-2 ${a.unlocked ? '' : 'grayscale opacity-50'}`}>
        {a.icon}
      </div>
      <div className={`font-bold text-sm mb-1 ${a.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        {a.name}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 min-h-[2rem]">
        {a.description}
      </div>

      {a.unlocked ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
            +{a.points} pts
          </span>
          <span className="text-green-600 dark:text-green-400">✓</span>
        </div>
      ) : (
        <div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {a.progress.current} / {a.progress.target}
          </div>
        </div>
      )}
    </div>
  );
}
