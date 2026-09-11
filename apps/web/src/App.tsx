import React, { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { DashboardView } from './pages/DashboardView';
import { ProblemsView } from './pages/ProblemsView';
import { WorkspaceView } from './pages/WorkspaceView';
import { EvaluationView } from './pages/EvaluationView';
import { EvolutionView } from './pages/EvolutionView';
import { SecurityView } from './pages/SecurityView';
import { api } from './services/api';
import { AttemptDetail, Problem } from '@designforge/shared';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('problems');
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<AttemptDetail | null>(null);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load active attempt detail when attemptId changes
  useEffect(() => {
    if (!activeAttemptId) {
      setActiveAttempt(null);
      setActiveProblem(null);
      return;
    }

    api.getAttempt(activeAttemptId)
      .then(res => {
        setActiveAttempt(res.attempt);
        return api.getProblem(res.attempt.problemId);
      })
      .then(res => setActiveProblem(res.problem))
      .catch(err => console.error('Failed to load active attempt context:', err));
  }, [activeAttemptId]);

  // Handler: User clicks "Start Designing" or selects a problem
  const handleSelectProblem = async (problemId: string, slug: string) => {
    try {
      setLoading(true);
      // Create new clean attempt with 0 pre-filled classes so candidate designs from scratch
      const res = await api.createAttempt(problemId, false);
      setActiveAttemptId(res.attempt.id);
      setCurrentTab('workspace');
    } catch (err: any) {
      console.error('Error starting attempt:', err);
      // Fallback: if problem fetch needed
      const probRes = await api.getProblem(problemId);
      setActiveProblem(probRes.problem);
      setCurrentTab('workspace');
    } finally {
      setLoading(false);
    }
  };

  // Handler: User clicks an attempt in recent activity
  const handleSelectAttempt = (attemptId: string) => {
    setActiveAttemptId(attemptId);
    api.getAttempt(attemptId).then(res => {
      if (res.attempt.status === 'COMPLETED' && res.attempt.evaluation) {
        setCurrentTab('evaluation');
      } else {
        setCurrentTab('workspace');
      }
    });
  };

  // Handler: Evaluation completed inside workspace
  const handleEvaluationComplete = (evalResult: any) => {
    if (activeAttemptId) {
      api.getAttempt(activeAttemptId).then(res => {
        setActiveAttempt(res.attempt);
        setCurrentTab('evaluation');
      });
    }
  };

  // Handler: Start next attempt iteration
  const handleStartNextIteration = async () => {
    if (!activeAttempt || !activeProblem) return;
    try {
      setLoading(true);
      const res = await api.createAttempt(activeProblem.id, true);
      setActiveAttemptId(res.attempt.id);
      setCurrentTab('workspace');
    } catch (err) {
      console.error('Failed to clone attempt:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'attempts') {
            // If user clicks My Attempts, take them to evaluation/history of active attempt
            if (activeAttempt?.evaluation) {
              setCurrentTab('evaluation');
            } else {
              setCurrentTab('problems');
            }
          } else {
            setCurrentTab(tab);
          }
        }}
        theme={theme}
        onSetTheme={setTheme}
        activeAttemptId={activeAttemptId}
      />

      <main className="flex-1 overflow-x-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono text-slate-400">Configuring Architectural Workstation...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                onStartDesigning={() => handleSelectProblem('prob-parking-lot', 'parking-lot')}
                onExploreProblems={() => setCurrentTab('problems')}
                onSelectAttempt={handleSelectAttempt}
              />
            )}

            {currentTab === 'problems' && (
              <ProblemsView onSelectProblem={handleSelectProblem} />
            )}

            {currentTab === 'workspace' && (
              activeAttemptId ? (
                <WorkspaceView
                  attemptId={activeAttemptId}
                  onEvaluationComplete={handleEvaluationComplete}
                  onCancel={() => setCurrentTab('problems')}
                />
              ) : (
                <ProblemsView onSelectProblem={handleSelectProblem} />
              )
            )}

            {currentTab === 'evaluation' && activeAttempt && activeProblem && (
              <EvaluationView
                attempt={activeAttempt}
                problem={activeProblem}
                onStartNextAttempt={handleStartNextIteration}
                onViewEvolution={() => setCurrentTab('evolution')}
              />
            )}

            {currentTab === 'evolution' && activeAttemptId && activeProblem && (
              <EvolutionView
                currentAttemptId={activeAttemptId}
                problem={activeProblem}
                onBackToEvaluation={() => setCurrentTab('evaluation')}
              />
            )}

            {currentTab === 'security' && <SecurityView />}
          </>
        )}
      </main>
    </div>
  );
}
