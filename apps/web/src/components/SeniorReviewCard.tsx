import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface SeniorReviewCardProps {
  reviewSummary: string;
  topRecommendations: string[];
  onImproveClick?: () => void;
}

export const SeniorReviewCard: React.FC<SeniorReviewCardProps> = ({
  reviewSummary,
  topRecommendations,
  onImproveClick
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative subtle accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-950/80 border border-violet-700/50 flex items-center justify-center text-violet-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
          Senior Staff Engineer Review
        </h3>
        <span className="text-[10px] font-mono uppercase bg-violet-950/60 text-violet-300 border border-violet-800/40 px-2 py-0.5 rounded-full ml-auto">
          Architectural Critique
        </span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-4 mb-6">
        <p className="text-slate-300 text-sm leading-relaxed font-sans">
          "{reviewSummary}"
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Top 3 Recommended Architectural Iterations
          </h4>
          {onImproveClick && (
            <button
              onClick={onImproveClick}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group transition-all"
            >
              <span>Apply in Next Attempt</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topRecommendations.map((rec, index) => (
            <div 
              key={index}
              className="bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 rounded-lg p-3.5 transition-colors flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
