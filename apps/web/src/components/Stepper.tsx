import React from 'react';
import { CheckCircle2, CircleDot, ChevronRight } from 'lucide-react';

export type StepState = 'choose' | 'design' | 'submit' | 'review' | 'improve';

interface StepperProps {
  currentStep: StepState;
  onSelectStep?: (step: StepState) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, onSelectStep }) => {
  const steps: Array<{ id: StepState; number: string; title: string }> = [
    { id: 'choose', number: '01', title: 'CHOOSE' },
    { id: 'design', number: '02', title: 'DESIGN' },
    { id: 'submit', number: '03', title: 'SUBMIT' },
    { id: 'review', number: '04', title: 'REVIEW' },
    { id: 'improve', number: '05', title: 'IMPROVE' }
  ];

  const getStepIndex = (step: StepState) => steps.findIndex(s => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full bg-slate-900/60 border-y border-slate-800/80 px-4 py-2.5 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between overflow-x-auto py-1 no-scrollbar">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div 
                onClick={() => onSelectStep && onSelectStep(step.id)}
                className={`flex items-center gap-2 cursor-pointer transition-all duration-300 group select-none ${
                  isCurrent
                    ? 'text-cyan-400 font-semibold scale-105'
                    : isCompleted
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border transition-all ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-glow-cyan animate-pulse'
                    : isCompleted
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                <span className="text-xs tracking-wider uppercase">
                  {step.title}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                  idx < currentIndex ? 'text-emerald-600' : 'text-slate-700'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
