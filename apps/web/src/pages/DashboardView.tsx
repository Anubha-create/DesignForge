import React, { useEffect, useState } from 'react';
import { 
  DashboardStats, 
  DimensionScore 
} from '@designforge/shared';
import { 
  Terminal, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Flame, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { RadarHealthChart } from '../components/RadarHealthChart';

interface DashboardViewProps {
  onStartDesigning: () => void;
  onExploreProblems: () => void;
  onSelectAttempt: (attemptId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartDesigning,
  onExploreProblems,
  onSelectAttempt
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getDashboard()
      .then(res => setStats(res.stats))
      .catch(err => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-400">Loading Engineering Workstation...</p>
      </div>
    );
  }

  const s = stats || {
    problemsSolved: 5,
    totalProblems: 5,
    totalAttempts: 17,
    avgDesignHealth: 81,
    improvementRate: 24,
    currentStreak: 4,
    bestDimension: 'Encapsulation' as any,
    dimensionAverages: [],
    recentActivity: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border border-slate-800 p-8 shadow-2xl overflow-hidden">
        {/* Subtle glow elements */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPLAINABLE LOW-LEVEL DESIGN STUDIO</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            DESIGN.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              DEFEND.
            </span>{' '}
            IMPROVE.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
            Practice Low-Level Design the way senior engineers review it. Go beyond superficial scores: discover concrete evidence, track architectural diffs across iterations, and stress-test your abstractions against evolving requirements.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartDesigning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow-cyan flex items-center gap-2 transition-all group"
            >
              <span>Start Designing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreProblems}
              className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all"
            >
              Explore Problems (5 Seeded)
            </button>
          </div>

          {/* Product Insight Quote */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">&bull;</span>
            <span>"Your score tells you where you are. Your design history tells you how you got better."</span>
          </div>
        </div>
      </div>

      {/* Engineering Workstation Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Problems Solved</span>
          <div className="text-2xl font-mono font-extrabold text-slate-100 my-1">
            0{s.problemsSolved}
            <span className="text-xs text-slate-500 font-normal"> / 0{s.totalProblems}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Core Library</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Attempts</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-400 my-1">
            {s.totalAttempts}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Iterative snapshots</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Avg Design Health</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 my-1">
            {s.avgDesignHealth}%
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Strong benchmark</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Improvement Rate</span>
          <div className="text-2xl font-mono font-extrabold text-cyan-400 my-1">
            +{s.improvementRate}%
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Git-style evolution</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Current Streak</span>
          <div className="text-2xl font-mono font-extrabold text-amber-400 my-1">
            0{s.currentStreak}
          </div>
          <span className="text-[10px] text-amber-400 font-mono">Days active</span>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Best Dimension</span>
          <div className="text-sm font-mono font-bold text-violet-400 my-1 truncate" title={s.bestDimension}>
            {s.bestDimension}
          </div>
          <span className="text-[10px] text-violet-400 font-mono">9.2 / 10 Avg</span>
        </div>
      </div>

      {/* Main Middle Row: Radar Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Component (7 cols) */}
        <div className="lg:col-span-7">
          <RadarHealthChart
            overallScore={s.avgDesignHealth}
            rating="STRONG"
            dimensions={s.dimensionAverages}
          />
        </div>

        {/* Recent Design Activity (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent Design Iterations</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Authoritative History
              </span>
            </div>

            <div className="space-y-2.5">
              {s.recentActivity.map(act => (
                <div
                  key={act.attemptId}
                  onClick={() => onSelectAttempt(act.attemptId)}
                  className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-lg p-3 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {act.problemTitle}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        Att #{act.attemptNumber}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {act.score !== undefined && (
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-cyan-400">{act.score}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-mono">All attempts are immutable</span>
            <button
              onClick={onExploreProblems}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View Problem Library &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
