import React, { useState } from 'react';
import { 
  EvaluationResult, 
  AttemptDetail, 
  Problem 
} from '@designforge/shared';
import { 
  Sparkles, 
  Flame, 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { RadarHealthChart } from '../components/RadarHealthChart';
import { SeniorReviewCard } from '../components/SeniorReviewCard';
import { CriterionCard } from '../components/CriterionCard';
import { BreakMyDesignSection } from '../components/BreakMyDesignSection';
import { Stepper } from '../components/Stepper';

interface EvaluationViewProps {
  attempt: AttemptDetail;
  problem: Problem;
  onStartNextAttempt: () => void;
  onViewEvolution: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  attempt,
  problem,
  onStartNextAttempt,
  onViewEvolution
}) => {
  const evaluation = attempt.evaluation;
  const [activeTab, setActiveTab] = useState<'criteria' | 'resilience'>('criteria');

  if (!evaluation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400 font-mono text-xs">No evaluation found for this attempt.</p>
      </div>
    );
  }

  const availableClasses = attempt.submission?.design?.classes.map(c => c.name) || [];
  const availableInterfaces = attempt.submission?.design?.interfaces.map(i => i.name) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* Progress Stepper */}
      <Stepper currentStep="review" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">
              {evaluation.evaluatorType} Evaluator
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated on {new Date(evaluation.evaluatedAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase mt-1">
            Design Review Complete &bull; {problem.title}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Attempt #{attempt.attemptNumber} Architectural Evaluation
          </p>
        </div>

        {/* Top Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onViewEvolution}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Design Evolution</span>
          </button>

          <button
            onClick={onStartNextAttempt}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-cyan transition-all"
          >
            <span>Next Iteration (Att #{attempt.attemptNumber + 1})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Review Grid: Radar Chart & Senior Staff Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RadarHealthChart
            overallScore={evaluation.overallScore}
            rating={evaluation.rating}
            dimensions={evaluation.dimensionScores}
          />
        </div>

        <div className="lg:col-span-7">
          <SeniorReviewCard
            reviewSummary={evaluation.seniorReviewSummary}
            topRecommendations={evaluation.topRecommendations}
            onImproveClick={onStartNextAttempt}
          />
        </div>
      </div>

      {/* Sub-Section Navigation: 12 Criteria vs Signature "Break My Design" */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'criteria'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>12 Architectural Dimensions ({evaluation.criterionResults.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resilience')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'resilience'
              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Break My Design (Resilience Test)</span>
        </button>
      </div>

      {/* Content for Active Tab */}
      {activeTab === 'criteria' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Explainable Dimension Assessments
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Every score is grounded in concrete evidence from your submitted design
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluation.criterionResults.map((crit, idx) => (
              <CriterionCard key={idx} criterion={crit} />
            ))}
          </div>
        </div>
      ) : (
        <BreakMyDesignSection
          attemptId={attempt.id}
          challenge={problem.requirementChange}
          availableClasses={availableClasses}
          availableInterfaces={availableInterfaces}
        />
      )}
    </div>
  );
};
