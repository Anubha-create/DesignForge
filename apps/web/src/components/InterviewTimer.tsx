import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

interface InterviewTimerProps {
  initialMinutes?: number;
  onTimeExpired?: () => void;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  initialMinutes = 30,
  onTimeExpired
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (onTimeExpired) onTimeExpired();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onTimeExpired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 300; // less than 5 mins

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
      isUrgent
        ? 'bg-red-950/60 border-red-800 text-red-300 animate-pulse'
        : 'bg-slate-900 border-slate-800 text-slate-300'
    }`}>
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-400' : 'text-cyan-400'}`} />
      <span className="font-bold text-sm">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>

      <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700/80">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title={isRunning ? 'Pause' : 'Start Timer'}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(initialMinutes * 60);
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
