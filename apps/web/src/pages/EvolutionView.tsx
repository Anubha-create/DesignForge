import React, { useState, useEffect } from 'react';
import { DesignDiff, Problem } from '@designforge/shared';
import { 
  GitBranch, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { DesignDiffViewer } from '../components/DesignDiffViewer';
import { Stepper } from '../components/Stepper';

interface EvolutionViewProps {
  currentAttemptId: string;
  problem: Problem;
  onBackToEvaluation: () => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  currentAttemptId,
  problem,
  onBackToEvaluation
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedAttempt1, setSelectedAttempt1] = useState<string>('');
  const [selectedAttempt2, setSelectedAttempt2] = useState<string>('');
  const [diff, setDiff] = useState<DesignDiff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [diffLoading, setDiffLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch attempt history for this problem
  useEffect(() => {
    api.getAttemptHistory(currentAttemptId)
      .then(res => {
        setHistory(res.history);
        const completed = res.history.filter((h: any) => h.status === 'COMPLETED');
        if (completed.length >= 2) {
          // Compare the earliest and latest attempt by default
          setSelectedAttempt1(completed[0].id);
          setSelectedAttempt2(completed[completed.length - 1].id);
        } else if (completed.length === 1) {
          setSelectedAttempt1(completed[0].id);
          setSelectedAttempt2(completed[0].id);
        }
      })
      .catch(err => setErrorMessage(err.message || 'Failed to load attempt history'))
      .finally(() => setLoading(false));
  }, [currentAttemptId]);

  // When selected attempts change, load diff
  useEffect(() => {
    if (!selectedAttempt1 || !selectedAttempt2 || selectedAttempt1 === selectedAttempt2) {
      setDiff(null);
      return;
    }

    setDiffLoading(true);
    setErrorMessage(null);

    api.compareAttempts(selectedAttempt1, selectedAttempt2)
      .then(res => setDiff(res.diff))
      .catch(err => setErrorMessage(err.message || 'Failed to generate architectural diff'))
      .finally(() => setDiffLoading(false));
  }, [selectedAttempt1, selectedAttempt2]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* Stepper */}
      <Stepper currentStep="improve" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
              Core Differentiator
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Attempt Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase mt-1">
            Design Evolution &bull; {problem.title}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Witness how your architectural decisions evolved across iterations.
          </p>
        </div>

        <button
          onClick={onBackToEvaluation}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold"
        >
          &larr; Back to Evaluation
        </button>
      </div>

      {/* Attempt History Progression Line */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Attempt Iteration History ({history.length} Attempt{history.length === 1 ? '' : 's'})</span>
        </h3>

        {/* Timeline dots */}
        <div className="flex flex-wrap items-center gap-4 py-2">
          {history.map((att, idx) => (
            <div key={att.id} className="flex items-center gap-3">
              <div className={`flex flex-col items-center p-3 rounded-xl border font-mono text-xs transition-all ${
                att.id === selectedAttempt2
                  ? 'bg-cyan-950/70 border-cyan-500 shadow-glow-cyan text-cyan-300'
                  : att.id === selectedAttempt1
                  ? 'bg-slate-900 border-indigo-500/80 text-indigo-300'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}>
                <span className="text-[10px] text-slate-500 uppercase">Attempt 0{att.attemptNumber}</span>
                <span className="text-lg font-bold text-slate-200 my-0.5">
                  {att.overallScore || '—'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">{att.rating || att.status}</span>
              </div>

              {idx < history.length - 1 && (
                <div className="flex items-center text-slate-600 font-bold text-xs">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparative Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <span className="text-slate-400">Compare Baseline:</span>
          <select
            value={selectedAttempt1}
            onChange={e => setSelectedAttempt1(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
          >
            {history.map(h => (
              <option key={h.id} value={h.id}>
                Attempt #{h.attemptNumber} (Health: {h.overallScore || 'N/A'})
              </option>
            ))}
          </select>

          <span className="text-slate-500 font-bold">&rarr;</span>

          <span className="text-slate-400">Target Iteration:</span>
          <select
            value={selectedAttempt2}
            onChange={e => setSelectedAttempt2(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300"
          >
            {history.map(h => (
              <option key={h.id} value={h.id}>
                Attempt #{h.attemptNumber} (Health: {h.overallScore || 'N/A'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff Result Rendering */}
      {diffLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">Computing Architectural Delta...</p>
        </div>
      ) : diff ? (
        <DesignDiffViewer diff={diff} />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-xs font-mono text-slate-400">
          Select two distinct completed attempts to inspect architectural differences.
        </div>
      )}
    </div>
  );
};
