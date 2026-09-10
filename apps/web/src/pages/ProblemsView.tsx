import React, { useState, useEffect } from 'react';
import { Difficulty } from '@designforge/shared';
import { 
  Clock, 
  Layers, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Filter,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface ProblemCardData {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  estimatedTime: string;
  summary: string;
  suggestedConcepts: string[];
  attemptsCount: number;
  bestScore: number | null;
  improvementPercent: number | null;
  status: 'SOLVED' | 'IN_PROGRESS' | 'UNTOUCHED';
}

interface ProblemsViewProps {
  onSelectProblem: (problemId: string, slug: string) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<ProblemCardData[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getProblems()
      .then(res => setProblems(res.problems))
      .catch(err => console.error('Failed to load problems:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProblems = problems.filter(p => {
    if (selectedDifficulty === 'ALL') return true;
    return p.difficulty === selectedDifficulty;
  });

  const getDifficultyBadge = (d: Difficulty) => {
    switch (d) {
      case 'EASY':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
      case 'MEDIUM':
        return 'bg-cyan-950/70 text-cyan-400 border-cyan-800/60';
      case 'HARD':
      default:
        return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
              LLD Problem Library
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              5 Practice Challenges
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Standard senior technical interview problems with hidden rubrics and resilience test cases.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDifficulty === diff
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading problem challenges...</p>
        </div>
      ) : (
        /* Problem Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map(p => {
            const hasAttempts = p.attemptsCount > 0;
            return (
              <div
                key={p.id}
                className="group bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-cyan flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(p.difficulty)}`}>
                      {p.difficulty}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Title & summary */}
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3 mb-4">
                    {p.summary}
                  </p>

                  {/* Architectural concepts tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.suggestedConcepts.map((concept, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800/80"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom stats & CTA */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="grid grid-cols-3 gap-2 text-center font-mono mb-4 text-xs">
                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase block">Attempts</span>
                      <span className="text-sm font-bold text-slate-200">{p.attemptsCount}</span>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase block">Best Health</span>
                      <span className="text-sm font-bold text-cyan-400">
                        {p.bestScore !== null ? `${p.bestScore}` : '—'}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase block">Delta</span>
                      <span className={`text-sm font-bold ${
                        p.improvementPercent && p.improvementPercent > 0 ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {p.improvementPercent && p.improvementPercent > 0 ? `+${p.improvementPercent}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProblem(p.id, p.slug)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 hover:from-cyan-950 hover:to-indigo-900 border border-slate-700 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:shadow-glow-cyan"
                  >
                    <span>{hasAttempts ? 'Continue Design' : 'Start Designing'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
