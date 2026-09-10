import React from 'react';
import { 
  EvaluationCriterionResult, 
  EvaluationRating 
} from '@designforge/shared';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Lightbulb, 
  FileText 
} from 'lucide-react';

interface CriterionCardProps {
  criterion: EvaluationCriterionResult;
}

export const CriterionCard: React.FC<CriterionCardProps> = ({ criterion }) => {
  const getStatusBadge = (status: EvaluationRating) => {
    switch (status) {
      case 'STRONG':
        return {
          bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
          icon: CheckCircle
        };
      case 'GOOD':
        return {
          bg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40',
          icon: CheckCircle
        };
      case 'NEEDS ATTENTION':
        return {
          bg: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
          icon: AlertTriangle
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-red-950/60 text-red-400 border-red-500/40',
          icon: AlertCircle
        };
    }
  };

  const badge = getStatusBadge(criterion.status);
  const StatusIcon = badge.icon;

  return (
    <div className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
            {criterion.dimension}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400">
              {criterion.score.toFixed(1)}/10
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
              <StatusIcon className="w-2.5 h-2.5" />
              <span>{criterion.status}</span>
            </span>
          </div>
        </div>

        {/* Evidence from submitted design */}
        <div className="mb-2.5 bg-slate-900/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Observed Evidence in Design:</span>
          </div>
          <p className="text-xs text-slate-300 font-mono italic leading-snug">
            "{criterion.evidence}"
          </p>
        </div>

        {/* Concern */}
        {criterion.concern && criterion.concern !== 'None identified.' && (
          <div className="mb-2.5 text-xs text-amber-400/90 leading-snug flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
            <span>{criterion.concern}</span>
          </div>
        )}

        {/* Suggestion */}
        <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-lg p-2.5 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 uppercase tracking-wider mb-1">
            <Lightbulb className="w-3 h-3 text-indigo-400" />
            <span>Architectural Suggestion:</span>
          </div>
          <p className="text-xs text-indigo-200/90 leading-snug">
            {criterion.suggestion}
          </p>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Confidence: <strong className="text-slate-300">{criterion.confidence}</strong></span>
      </div>
    </div>
  );
};
