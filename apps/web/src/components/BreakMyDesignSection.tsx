import React, { useState } from 'react';
import { 
  RequirementChangeSpec, 
  BreakMyDesignInput, 
  BreakMyDesignEvaluation 
} from '@designforge/shared';
import { 
  Flame, 
  ShieldAlert, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface BreakMyDesignSectionProps {
  attemptId: string;
  challenge: RequirementChangeSpec;
  availableClasses: string[];
  availableInterfaces: string[];
}

export const BreakMyDesignSection: React.FC<BreakMyDesignSectionProps> = ({
  attemptId,
  challenge,
  availableClasses,
  availableInterfaces
}) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([]);
  const [requiredChanges, setRequiredChanges] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [tradeoffs, setTradeoffs] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resilienceResult, setResilienceResult] = useState<BreakMyDesignEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleClass = (c: string) => {
    setSelectedClasses(prev => 
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const toggleInterface = (i: string) => {
    setSelectedInterfaces(prev => 
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasoning || reasoning.trim().length < 10) {
      setErrorMsg('Please articulate your architectural reasoning (at least 10 characters).');
      return;
    }

    const changesArray = requiredChanges
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (changesArray.length === 0) {
      setErrorMsg('Please specify at least one concrete architectural change.');
      return;
    }

    const tradeoffsArray = tradeoffs
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload: BreakMyDesignInput = {
      affectedClasses: selectedClasses,
      affectedInterfaces: selectedInterfaces,
      requiredChanges: changesArray,
      reasoning: reasoning.trim(),
      tradeoffs: tradeoffsArray
    };

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await api.breakMyDesign(attemptId, payload);
      setResilienceResult(res.resilience);
    } catch (err: any) {
      setErrorMsg(err.message || 'Resilience evaluation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      {/* Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-wider text-slate-100 uppercase">
                Break My Design
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/40 uppercase">
                Resilience Stress-Test
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Does your Low-Level Design survive evolving requirements without architectural collapse?
            </p>
          </div>
        </div>
      </div>

      {/* Injected Requirement Challenge */}
      <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40 border border-amber-800/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-400 mb-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>Requirement Evolution: {challenge.title}</span>
        </div>
        <p className="text-sm text-slate-200 font-sans mb-3 leading-relaxed">
          {challenge.scenario}
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
          <div className="text-slate-400 font-mono text-[11px] uppercase">New Requirement:</div>
          <p className="text-slate-200 font-semibold">{challenge.newRequirement}</p>
          <p className="text-[11px] text-cyan-400 italic pt-1">&bull; Architectural Hint: {challenge.architecturalImpactHint}</p>
        </div>
      </div>

      {/* If already evaluated, show Resilience Report */}
      {resilienceResult ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Score Callout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-glow-cyan">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-extrabold font-mono text-cyan-400">
                {resilienceResult.resilienceScore}%
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                  Design Resilience Score
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {resilienceResult.rating} Architectural Defense
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-xs">
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Classes Affected</span>
                <span className="text-base font-bold text-slate-200">{resilienceResult.affectedClassesCount}</span>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Interfaces Affected</span>
                <span className="text-base font-bold text-slate-200">{resilienceResult.affectedInterfacesCount}</span>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Coupling Blast</span>
                <span className={`text-base font-bold ${
                  resilienceResult.couplingImpact === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
                }`}>{resilienceResult.couplingImpact}</span>
              </div>
              <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Regression Risk</span>
                <span className={`text-base font-bold ${
                  resilienceResult.regressionRisk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
                }`}>{resilienceResult.regressionRisk}</span>
              </div>
            </div>
          </div>

          {/* Detailed Evidence & Verdict */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-2">
                Resilience Evidence & Blast Radius
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 font-sans">
                {resilienceResult.evidence.map((ev, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-2">
                OCP & Architectural Recommendations
              </h4>
              <div className="mb-3 text-xs text-cyan-300 font-mono bg-cyan-950/30 border border-cyan-900/50 p-2.5 rounded-lg">
                {resilienceResult.modificationVsExtension}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {resilienceResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={() => setResilienceResult(null)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              &larr; Re-test with different mitigation approach
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Affected Classes Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              1. Which Existing Classes Require Modification?
            </label>
            <div className="flex flex-wrap gap-2">
              {availableClasses.map(c => {
                const isSelected = selectedClasses.includes(c);
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleClass(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{c}
                  </button>
                );
              })}
              {availableClasses.length === 0 && (
                <span className="text-xs text-slate-500 italic">No classes in current design yet.</span>
              )}
            </div>
          </div>

          {/* Affected Interfaces Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Which Interfaces Must Change Their Contracts? (Or leave empty if contracts stay closed)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterfaces.map(i => {
                const isSelected = selectedInterfaces.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => toggleInterface(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{i}
                  </button>
                );
              })}
              {availableInterfaces.length === 0 && (
                <span className="text-xs text-slate-500 italic">No interfaces defined.</span>
              )}
            </div>
          </div>

          {/* Required Changes */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Concrete Architectural Changes Required (One per line)
            </label>
            <textarea
              rows={3}
              value={requiredChanges}
              onChange={e => setRequiredChanges(e.target.value)}
              placeholder="e.g.: Introduce ElectricParkingSpot subclass with meter telemetry&#10;Add EVChargingPolicy to calculate kilowatt-hour billing"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Reasoning */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              4. Architectural Rationale & Defense
            </label>
            <textarea
              rows={3}
              value={reasoning}
              onChange={e => setReasoning(e.target.value)}
              placeholder="Defend why your design changes minimize coupling, uphold Single Responsibility, and protect existing callers from breaking..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Trade-offs */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              5. Acknowledged Trade-offs (One per line)
            </label>
            <textarea
              rows={2}
              value={tradeoffs}
              onChange={e => setTradeoffs(e.target.value)}
              placeholder="e.g.: Added polymorphism increases initial object hierarchy depth"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Blast Radius...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Execute Resilience Test</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
