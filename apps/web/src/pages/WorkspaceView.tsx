import React, { useState, useEffect } from 'react';
import { 
  Problem, 
  AttemptDetail, 
  StructuredDesign, 
  ClassDefinition, 
  InterfaceDefinition, 
  RelationshipDefinition, 
  PatternChoice,
  RelationshipType,
  Visibility
} from '@designforge/shared';
import { 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Layers, 
  Share2, 
  Cpu, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { UmlGenerator } from '../services/umlGenerator';
import { MermaidViewer } from '../components/MermaidViewer';
import { Stepper } from '../components/Stepper';
import { InterviewTimer } from '../components/InterviewTimer';

interface WorkspaceViewProps {
  attemptId: string;
  onEvaluationComplete: (evalResult: any) => void;
  onCancel: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  attemptId,
  onEvaluationComplete,
  onCancel
}) => {
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [design, setDesign] = useState<StructuredDesign>({
    assumptions: [],
    classes: [],
    interfaces: [],
    relationships: [],
    patterns: [],
    tradeoffs: [],
    edgeCases: []
  });
  const [completeness, setCompleteness] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'classes' | 'interfaces' | 'relationships' | 'patterns' | 'assumptions' | 'tradeoffs'>('classes');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<any[]>([]);

  // Load attempt & problem specs
  useEffect(() => {
    api.getAttempt(attemptId)
      .then(res => {
        setAttempt(res.attempt);
        if (res.attempt.submission?.design) {
          setDesign(res.attempt.submission.design);
          setCompleteness(res.attempt.submission.completenessScore || 0);
        }
        return api.getProblem(res.attempt.problemId);
      })
      .then(res => setProblem(res.problem))
      .catch(err => setErrorMessage(err.message || 'Failed to load workspace attempt'));
  }, [attemptId]);

  // Autosave draft handler
  const handleSave = async (showToast: boolean = true) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      const res = await api.saveSubmission(attemptId, design);
      setCompleteness(res.completenessScore);
      if (showToast) {
        setStatusMessage('Draft saved successfully');
        setTimeout(() => setStatusMessage(null), 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit and evaluate handler
  const handleEvaluate = async () => {
    try {
      setIsEvaluating(true);
      setErrorMessage(null);
      setValidationIssues([]);

      // 1. Save latest state
      await handleSave(false);

      // 2. Submit & Evaluate
      await api.submitDesign(attemptId);
      const evalRes = await api.evaluateAttempt(attemptId);
      onEvaluationComplete(evalRes.evaluation);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        setValidationIssues(err.details);
      }
      setErrorMessage(err.message || 'Evaluation failed. Review structural integrity.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Structured Mutators for Classes
  const addClass = () => {
    const newCls: ClassDefinition = {
      name: `Entity_${design.classes.length + 1}`,
      responsibility: 'Describe single responsibility...',
      attributes: [],
      methods: []
    };
    setDesign(prev => ({ ...prev, classes: [...prev.classes, newCls] }));
  };

  const removeClass = (index: number) => {
    setDesign(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const updateClass = (index: number, updated: Partial<ClassDefinition>) => {
    setDesign(prev => {
      const updatedClasses = [...prev.classes];
      updatedClasses[index] = { ...updatedClasses[index], ...updated };
      return { ...prev, classes: updatedClasses };
    });
  };

  const addMethod = (classIndex: number) => {
    const m = {
      name: 'newMethod',
      returnType: 'void',
      parameters: [],
      visibility: 'public' as Visibility
    };
    const cls = design.classes[classIndex];
    updateClass(classIndex, { methods: [...(cls.methods || []), m] });
  };

  const addAttribute = (classIndex: number) => {
    const a = {
      name: 'newAttribute',
      type: 'string',
      visibility: 'private' as Visibility
    };
    const cls = design.classes[classIndex];
    updateClass(classIndex, { attributes: [...(cls.attributes || []), a] });
  };

  // Structured Mutators for Interfaces
  const addInterface = () => {
    const newIface: InterfaceDefinition = {
      name: `IStrategy_${design.interfaces.length + 1}`,
      methods: [
        {
          name: 'execute',
          returnType: 'void',
          parameters: [],
          visibility: 'public'
        }
      ]
    };
    setDesign(prev => ({ ...prev, interfaces: [...prev.interfaces, newIface] }));
  };

  const removeInterface = (index: number) => {
    setDesign(prev => ({
      ...prev,
      interfaces: prev.interfaces.filter((_, i) => i !== index)
    }));
  };

  // Structured Mutators for Relationships
  const addRelationship = () => {
    const source = design.classes[0]?.name || 'SourceClass';
    const target = design.classes[1]?.name || design.interfaces[0]?.name || 'TargetClass';
    const newRel: RelationshipDefinition = {
      source,
      target,
      type: 'COMPOSITION'
    };
    setDesign(prev => ({ ...prev, relationships: [...prev.relationships, newRel] }));
  };

  const removeRelationship = (index: number) => {
    setDesign(prev => ({
      ...prev,
      relationships: prev.relationships.filter((_, i) => i !== index)
    }));
  };

  // Structured Mutators for Patterns
  const addPattern = () => {
    const p: PatternChoice = {
      name: 'Strategy Pattern',
      reason: 'Encapsulate family of interchangeable algorithms',
      tradeoff: 'Introduces extra interface contracts'
    };
    setDesign(prev => ({ ...prev, patterns: [...prev.patterns, p] }));
  };

  const removePattern = (index: number) => {
    setDesign(prev => ({
      ...prev,
      patterns: prev.patterns.filter((_, i) => i !== index)
    }));
  };

  // Generic List Mutators for Assumptions, Tradeoffs, Edge Cases
  const addTextItem = (field: 'assumptions' | 'tradeoffs' | 'edgeCases') => {
    setDesign(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const updateTextItem = (field: 'assumptions' | 'tradeoffs' | 'edgeCases', index: number, val: string) => {
    setDesign(prev => {
      const list = [...(prev[field] || [])];
      list[index] = val;
      return { ...prev, [field]: list };
    });
  };

  const removeTextItem = (field: 'assumptions' | 'tradeoffs' | 'edgeCases', index: number) => {
    setDesign(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const mermaidChart = UmlGenerator.toMermaid(design);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Stepper & Workstation Action Bar */}
      <Stepper currentStep="design" />

      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-900/70 text-xs">
        {/* Left: Problem Title & Attempt Info */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-100 uppercase tracking-wider">
            {problem?.title || 'Low-Level Design Problem'}
          </span>
          <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
            Attempt #{attempt?.attemptNumber || 1}
          </span>
          <InterviewTimer initialMinutes={30} />
        </div>

        {/* Right: Actions, Completeness & Evaluation */}
        <div className="flex items-center gap-3">
          {/* Completeness Meter */}
          <div className="flex items-center gap-2 font-mono text-xs pr-2 border-r border-slate-800">
            <span className="text-slate-400 text-[11px] uppercase">Completeness:</span>
            <span className="font-bold text-cyan-400">{completeness}%</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* Status Message / Errors */}
          {statusMessage && (
            <span className="text-emerald-400 font-mono text-[11px] animate-fadeIn">
              ✓ {statusMessage}
            </span>
          )}

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono tracking-wider flex items-center gap-2 shadow-glow-cyan transition-all"
          >
            {isEvaluating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>SUBMIT & EVALUATE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation / Error Banner */}
      {errorMessage && (
        <div className="bg-red-950/80 border-b border-red-800 px-6 py-2 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {validationIssues.length > 0 && (
            <span className="font-mono text-[11px] text-red-400">
              {validationIssues.length} issue(s) detected
            </span>
          )}
        </div>
      )}

      {/* 3-Panel Workstation Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* PANEL 1: Requirements & Specs (3 cols) */}
        <div className="col-span-3 border-r border-slate-800 bg-slate-950/60 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-300 pb-2 border-b border-slate-800">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Problem Requirements</span>
          </div>

          {problem ? (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                  Functional Requirements
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {problem.functionalRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                  Design Expectations
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {problem.designExpectations.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-violet-400 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                  Technical Constraints
                </h4>
                <ul className="space-y-1 text-slate-400">
                  {problem.constraints.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
                  Edge Cases
                </h4>
                <ul className="space-y-1 text-slate-400">
                  {problem.edgeCases.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono">Loading requirements...</p>
          )}
        </div>

        {/* PANEL 2: Structured Design Editor (5 cols) */}
        <div className="col-span-5 border-r border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
          {/* Editor Sub-Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-slate-900/50 text-xs font-mono overflow-x-auto no-scrollbar">
            {[
              { id: 'classes', label: `Classes (${design.classes.length})` },
              { id: 'interfaces', label: `Interfaces (${design.interfaces.length})` },
              { id: 'relationships', label: `Relations (${design.relationships.length})` },
              { id: 'patterns', label: `Patterns (${design.patterns.length})` },
              { id: 'assumptions', label: `Assumptions (${design.assumptions.length})` },
              { id: 'tradeoffs', label: `Trade-offs (${design.tradeoffs.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* CLASSES TAB */}
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    Domain Classes & Responsibilities
                  </span>
                  <button
                    onClick={addClass}
                    className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 text-xs font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Class
                  </button>
                </div>

                {design.classes.map((cls, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={cls.name}
                        onChange={e => updateClass(idx, { name: e.target.value })}
                        placeholder="ClassName"
                        className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono font-bold text-sm text-cyan-300 w-48 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={() => removeClass(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Remove Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        Single Responsibility:
                      </label>
                      <input
                        type="text"
                        value={cls.responsibility}
                        onChange={e => updateClass(idx, { responsibility: e.target.value })}
                        placeholder="What specific domain responsibility does this class own?"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Attributes */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500">Attributes</span>
                        <button
                          onClick={() => addAttribute(idx)}
                          className="text-[10px] font-mono text-cyan-400 hover:underline"
                        >
                          + Add Attribute
                        </button>
                      </div>
                      <div className="space-y-1">
                        {cls.attributes?.map((attr, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2 font-mono text-xs">
                            <select
                              value={attr.visibility}
                              onChange={e => {
                                const newAttrs = [...cls.attributes];
                                newAttrs[aIdx].visibility = e.target.value as Visibility;
                                updateClass(idx, { attributes: newAttrs });
                              }}
                              className="bg-slate-950 border border-slate-800 rounded px-1 text-[11px] text-slate-400"
                            >
                              <option value="private">- private</option>
                              <option value="public">+ public</option>
                              <option value="protected"># protected</option>
                            </select>
                            <input
                              type="text"
                              value={attr.name}
                              onChange={e => {
                                const newAttrs = [...cls.attributes];
                                newAttrs[aIdx].name = e.target.value;
                                updateClass(idx, { attributes: newAttrs });
                              }}
                              placeholder="attributeName"
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 flex-1"
                            />
                            <input
                              type="text"
                              value={attr.type}
                              onChange={e => {
                                const newAttrs = [...cls.attributes];
                                newAttrs[aIdx].type = e.target.value;
                                updateClass(idx, { attributes: newAttrs });
                              }}
                              placeholder="type"
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-400 w-24"
                            />
                            <button
                              onClick={() => {
                                const newAttrs = cls.attributes.filter((_, i) => i !== aIdx);
                                updateClass(idx, { attributes: newAttrs });
                              }}
                              className="text-slate-600 hover:text-red-400"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Methods */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500">Methods</span>
                        <button
                          onClick={() => addMethod(idx)}
                          className="text-[10px] font-mono text-cyan-400 hover:underline"
                        >
                          + Add Method
                        </button>
                      </div>
                      <div className="space-y-1">
                        {cls.methods?.map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-2 font-mono text-xs">
                            <input
                              type="text"
                              value={m.name}
                              onChange={e => {
                                const newMethods = [...cls.methods];
                                newMethods[mIdx].name = e.target.value;
                                updateClass(idx, { methods: newMethods });
                              }}
                              placeholder="methodName"
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 flex-1"
                            />
                            <span className="text-slate-500">:</span>
                            <input
                              type="text"
                              value={m.returnType}
                              onChange={e => {
                                const newMethods = [...cls.methods];
                                newMethods[mIdx].returnType = e.target.value;
                                updateClass(idx, { methods: newMethods });
                              }}
                              placeholder="returnType"
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-400 w-24"
                            />
                            <button
                              onClick={() => {
                                const newMethods = cls.methods.filter((_, i) => i !== mIdx);
                                updateClass(idx, { methods: newMethods });
                              }}
                              className="text-slate-600 hover:text-red-400"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {design.classes.length === 0 && (
                  <div className="text-center py-8 text-slate-500 font-mono text-xs">
                    No classes defined yet. Click "+ Add Class" to begin.
                  </div>
                )}
              </div>
            )}

            {/* INTERFACES TAB */}
            {activeTab === 'interfaces' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    Polymorphic Interfaces
                  </span>
                  <button
                    onClick={addInterface}
                    className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-400 hover:bg-indigo-900 border border-indigo-800 text-xs font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Interface
                  </button>
                </div>

                {design.interfaces.map((iface, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={iface.name}
                        onChange={e => {
                          const ifaces = [...design.interfaces];
                          ifaces[idx].name = e.target.value;
                          setDesign(prev => ({ ...prev, interfaces: ifaces }));
                        }}
                        placeholder="InterfaceName"
                        className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono font-bold text-sm text-indigo-300 w-48 focus:outline-none"
                      />
                      <button
                        onClick={() => removeInterface(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {iface.methods.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2 font-mono text-xs">
                          <input
                            type="text"
                            value={m.name}
                            onChange={e => {
                              const ifaces = [...design.interfaces];
                              ifaces[idx].methods[mIdx].name = e.target.value;
                              setDesign(prev => ({ ...prev, interfaces: ifaces }));
                            }}
                            placeholder="method"
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 flex-1"
                          />
                          <span className="text-slate-500">:</span>
                          <input
                            type="text"
                            value={m.returnType}
                            onChange={e => {
                              const ifaces = [...design.interfaces];
                              ifaces[idx].methods[mIdx].returnType = e.target.value;
                              setDesign(prev => ({ ...prev, interfaces: ifaces }));
                            }}
                            placeholder="returnType"
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-400 w-24"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RELATIONSHIPS TAB */}
            {activeTab === 'relationships' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    Structural Relationships
                  </span>
                  <button
                    onClick={addRelationship}
                    className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 text-xs font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Relationship
                  </button>
                </div>

                {design.relationships.map((rel, idx) => (
                  <div key={idx} className="flex items-center gap-2 font-mono text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <input
                      type="text"
                      value={rel.source}
                      onChange={e => {
                        const rels = [...design.relationships];
                        rels[idx].source = e.target.value;
                        setDesign(prev => ({ ...prev, relationships: rels }));
                      }}
                      placeholder="Source"
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 w-32"
                    />

                    <select
                      value={rel.type}
                      onChange={e => {
                        const rels = [...design.relationships];
                        rels[idx].type = e.target.value as RelationshipType;
                        setDesign(prev => ({ ...prev, relationships: rels }));
                      }}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-400 font-bold"
                    >
                      <option value="INHERITANCE">Inherits &rarr;</option>
                      <option value="IMPLEMENTATION">Implements ..&gt;</option>
                      <option value="COMPOSITION">Composes *--</option>
                      <option value="AGGREGATION">Aggregates o--</option>
                      <option value="DEPENDENCY">Depends ..&gt;</option>
                    </select>

                    <input
                      type="text"
                      value={rel.target}
                      onChange={e => {
                        const rels = [...design.relationships];
                        rels[idx].target = e.target.value;
                        setDesign(prev => ({ ...prev, relationships: rels }));
                      }}
                      placeholder="Target"
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 w-32"
                    />

                    <button
                      onClick={() => removeRelationship(idx)}
                      className="text-slate-500 hover:text-red-400 p-1 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* PATTERNS TAB */}
            {activeTab === 'patterns' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    Design Patterns & Justifications
                  </span>
                  <button
                    onClick={addPattern}
                    className="px-2.5 py-1 rounded bg-violet-950 text-violet-400 hover:bg-violet-900 border border-violet-800 text-xs font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Pattern
                  </button>
                </div>

                {design.patterns.map((pat, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={pat.name}
                        onChange={e => {
                          const pats = [...design.patterns];
                          pats[idx].name = e.target.value;
                          setDesign(prev => ({ ...prev, patterns: pats }));
                        }}
                        placeholder="Pattern Name (e.g. Strategy)"
                        className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono font-bold text-violet-300 w-48"
                      />
                      <button onClick={() => removePattern(idx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={pat.reason}
                      onChange={e => {
                        const pats = [...design.patterns];
                        pats[idx].reason = e.target.value;
                        setDesign(prev => ({ ...prev, patterns: pats }));
                      }}
                      placeholder="Why does this pattern belong here?"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200"
                    />
                    <input
                      type="text"
                      value={pat.tradeoff}
                      onChange={e => {
                        const pats = [...design.patterns];
                        pats[idx].tradeoff = e.target.value;
                        setDesign(prev => ({ ...prev, patterns: pats }));
                      }}
                      placeholder="What is the architectural trade-off cost?"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-amber-300/80"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ASSUMPTIONS & TRADEOFFS TABS */}
            {(activeTab === 'assumptions' || activeTab === 'tradeoffs') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    {activeTab === 'assumptions' ? 'Engineering Assumptions' : 'Architectural Trade-offs'}
                  </span>
                  <button
                    onClick={() => addTextItem(activeTab)}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                {design[activeTab].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={e => updateTextItem(activeTab, idx, e.target.value)}
                      placeholder={activeTab === 'assumptions' ? 'e.g. Single physical gate' : 'e.g. Memory vs Latency'}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => removeTextItem(activeTab, idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL 3: Live Dynamic Mermaid UML Viewer (4 cols) */}
        <div className="col-span-4 bg-slate-950 flex flex-col overflow-hidden">
          <MermaidViewer chart={mermaidChart} className="h-full border-none rounded-none" />
        </div>
      </div>
    </div>
  );
};
