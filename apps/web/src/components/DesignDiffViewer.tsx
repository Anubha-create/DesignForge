import React from 'react';
import { DesignDiff } from '@designforge/shared';
import { 
  GitCommit, 
  GitBranch, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';

interface DesignDiffViewerProps {
  diff: DesignDiff;
}

export const DesignDiffViewer: React.FC<DesignDiffViewerProps> = ({ diff }) => {
  const isImproved = diff.verdict === 'IMPROVED';
  const isRegressed = diff.verdict === 'REGRESSED';

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header comparison banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
              Architectural Evolution (Git-Style Diff)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Comparing Attempt #{diff.previousAttemptNumber} &rarr; Attempt #{diff.currentAttemptNumber}
            </p>
          </div>
        </div>

        {/* Score delta badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">Attempt {diff.previousAttemptNumber}</span>
            <span className="text-lg font-bold text-slate-300">{diff.previousScore}</span>
          </div>
          <span className="text-slate-600 font-mono">&rarr;</span>
          <div className="text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">Attempt {diff.currentAttemptNumber}</span>
            <span className="text-lg font-bold text-cyan-400">{diff.currentScore}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1 ${
            diff.scoreDelta >= 0
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
              : 'bg-red-950/60 text-red-400 border-red-500/40'
          }`}>
            {diff.scoreDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{diff.scoreDelta >= 0 ? `+${diff.scoreDelta}` : diff.scoreDelta} pts</span>
          </div>
        </div>
      </div>

      {/* Did your design improve? Box */}
      <div className={`p-4 rounded-xl border ${
        isImproved
          ? 'bg-emerald-950/20 border-emerald-800/40'
          : isRegressed
          ? 'bg-red-950/20 border-red-800/40'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-2 mb-1.5">
          {isImproved ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isRegressed ? (
            <XCircle className="w-4 h-4 text-red-400" />
          ) : (
            <HelpCircle className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Did your design improve?{' '}
            <strong className={isImproved ? 'text-emerald-400' : isRegressed ? 'text-red-400' : 'text-slate-300'}>
              {diff.verdict}
            </strong>
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans pl-6">
          {diff.narrativeSummary}
        </p>
      </div>

      {/* Structural delta grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Structural Additions & Modifications */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider mb-3 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Structural Evolutions & Additions</span>
          </h4>

          <div className="space-y-2 text-xs font-mono">
            {diff.addedClasses.map(c => (
              <div key={c} className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-2.5 py-1.5 rounded border border-emerald-900/40">
                <span>+</span>
                <span>Class <strong>{c}</strong> added</span>
              </div>
            ))}

            {diff.addedInterfaces.map(i => (
              <div key={i} className="flex items-center gap-2 text-indigo-400 bg-indigo-950/30 px-2.5 py-1.5 rounded border border-indigo-900/40">
                <span>+</span>
                <span>Interface <strong>{i}</strong> extracted</span>
              </div>
            ))}

            {diff.modifiedClasses.map(m => (
              <div key={m.name} className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span>~</span>
                  <span>Modified <strong>{m.name}</strong></span>
                </div>
                <ul className="pl-4 mt-1 space-y-0.5 text-[11px] text-slate-400">
                  {m.changes.map((ch, idx) => (
                    <li key={idx}>&bull; {ch}</li>
                  ))}
                </ul>
              </div>
            ))}

            {diff.addedClasses.length === 0 && diff.addedInterfaces.length === 0 && diff.modifiedClasses.length === 0 && (
              <p className="text-slate-500 italic text-[11px]">No structural additions detected.</p>
            )}
          </div>
        </div>

        {/* Removals & Regressions */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
          <h4 className="text-xs font-mono font-semibold uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Removals & Regressions</span>
          </h4>

          <div className="space-y-2 text-xs font-mono">
            {diff.removedClasses.map(c => (
              <div key={c} className="flex items-center gap-2 text-red-400 bg-red-950/30 px-2.5 py-1.5 rounded border border-red-900/40">
                <span>-</span>
                <span>Removed class <strong>{c}</strong></span>
              </div>
            ))}

            {diff.removedInterfaces.map(i => (
              <div key={i} className="flex items-center gap-2 text-red-400 bg-red-950/30 px-2.5 py-1.5 rounded border border-red-900/40">
                <span>-</span>
                <span>Removed interface <strong>{i}</strong></span>
              </div>
            ))}

            {diff.regressions.map((reg, idx) => (
              <div key={idx} className="flex items-center gap-2 text-amber-400 bg-amber-950/30 px-2.5 py-1.5 rounded border border-amber-900/40">
                <span>!</span>
                <span>{reg}</span>
              </div>
            ))}

            {diff.removedClasses.length === 0 && diff.removedInterfaces.length === 0 && diff.regressions.length === 0 && (
              <p className="text-emerald-500/80 italic text-[11px]">Zero regressions detected! Clean refactor.</p>
            )}
          </div>
        </div>
      </div>

      {/* Dimensional Progression Table */}
      <div>
        <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider mb-2">
          Dimension Score Progression
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono">
          {diff.dimensionDeltas.map(d => (
            <div key={d.dimension} className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 truncate pr-1" title={d.dimension}>{d.dimension}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-slate-400">{d.previousScore}</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="font-bold text-slate-200">{d.currentScore}</span>
                <span className={`text-[10px] font-bold ${d.delta > 0 ? 'text-emerald-400' : d.delta < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  ({d.delta > 0 ? `+${d.delta}` : d.delta})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
