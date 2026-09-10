export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export type EvaluationRating = 'CRITICAL' | 'NEEDS ATTENTION' | 'GOOD' | 'STRONG';

export type RelationshipType = 
  | 'INHERITANCE' 
  | 'COMPOSITION' 
  | 'AGGREGATION' 
  | 'DEPENDENCY' 
  | 'IMPLEMENTATION';

export type Visibility = 'public' | 'private' | 'protected';

export type EvaluationDimension =
  | 'Requirement Understanding'
  | 'Responsibility Assignment'
  | 'Coupling'
  | 'Cohesion'
  | 'Encapsulation'
  | 'Interfaces'
  | 'Abstraction'
  | 'Pattern Fit'
  | 'Extensibility'
  | 'Edge Cases'
  | 'Testability'
  | 'Explanation Quality';

export interface AttributeDefinition {
  name: string;
  type: string;
  visibility: Visibility;
}

export interface MethodParameter {
  name: string;
  type: string;
}

export interface MethodDefinition {
  name: string;
  returnType: string;
  parameters: MethodParameter[];
  visibility: Visibility;
}

export interface ClassDefinition {
  name: string;
  responsibility: string;
  attributes: AttributeDefinition[];
  methods: MethodDefinition[];
}

export interface InterfaceDefinition {
  name: string;
  description?: string;
  methods: MethodDefinition[];
}

export interface RelationshipDefinition {
  source: string;
  target: string;
  type: RelationshipType;
  label?: string;
}

export interface PatternChoice {
  name: string;
  reason: string;
  tradeoff: string;
}

export interface StructuredDesign {
  assumptions: string[];
  classes: ClassDefinition[];
  interfaces: InterfaceDefinition[];
  relationships: RelationshipDefinition[];
  patterns: PatternChoice[];
  tradeoffs: string[];
  edgeCases: string[];
}

export interface RequirementChangeSpec {
  id: string;
  title: string;
  scenario: string;
  newRequirement: string;
  architecturalImpactHint: string;
  edgeCases: string[];
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  estimatedTime: string;
  summary: string;
  problemStatement: string;
  functionalRequirements: string[];
  designExpectations: string[];
  constraints: string[];
  edgeCases: string[];
  clarifyingQuestions: string[];
  suggestedConcepts: string[];
  hiddenRubricNotes: string[];
  requirementChange: RequirementChangeSpec;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationCriterionResult {
  dimension: EvaluationDimension;
  score: number; // 0 to 10
  status: EvaluationRating;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DimensionScore {
  dimension: EvaluationDimension;
  score: number;
  maxScore: number;
}

export interface EvaluationResult {
  overallScore: number; // 0 to 100
  rating: EvaluationRating;
  seniorReviewSummary: string;
  topRecommendations: string[];
  dimensionScores: DimensionScore[];
  criterionResults: EvaluationCriterionResult[];
  evaluatorType: 'DEMO' | 'AI' | 'DETERMINISTIC';
  evaluatedAt: string;
}

export interface SubmissionPayload {
  design: StructuredDesign;
}

export interface AttemptDetail {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  attemptNumber: number;
  status: AttemptStatus;
  submission?: {
    id: string;
    design: StructuredDesign;
    completenessScore: number;
    updatedAt: string;
  } | null;
  evaluation?: EvaluationResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface DesignDiff {
  previousAttemptId: string;
  previousAttemptNumber: number;
  currentAttemptId: string;
  currentAttemptNumber: number;
  previousScore: number;
  currentScore: number;
  scoreDelta: number;
  addedClasses: string[];
  removedClasses: string[];
  modifiedClasses: Array<{
    name: string;
    changes: string[];
  }>;
  addedInterfaces: string[];
  removedInterfaces: string[];
  addedRelationships: Array<{
    source: string;
    target: string;
    type: RelationshipType;
  }>;
  removedRelationships: Array<{
    source: string;
    target: string;
    type: RelationshipType;
  }>;
  dimensionDeltas: Array<{
    dimension: EvaluationDimension;
    previousScore: number;
    currentScore: number;
    delta: number;
  }>;
  improvements: string[];
  regressions: string[];
  verdict: 'IMPROVED' | 'REGRESSED' | 'STABLE';
  narrativeSummary: string;
}

export interface BreakMyDesignInput {
  affectedClasses: string[];
  affectedInterfaces: string[];
  requiredChanges: string[];
  reasoning: string;
  tradeoffs: string[];
}

export interface BreakMyDesignEvaluation {
  resilienceScore: number; // 0 to 100
  rating: EvaluationRating;
  affectedClassesCount: number;
  affectedInterfacesCount: number;
  newAbstractionsCount: number;
  couplingImpact: 'LOW' | 'MEDIUM' | 'HIGH';
  extensibilityRating: 'STRONG' | 'MODERATE' | 'POOR';
  modificationVsExtension: string;
  regressionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence: string[];
  verdictSummary: string;
  recommendations: string[];
}

export interface DashboardStats {
  problemsSolved: number;
  totalProblems: number;
  totalAttempts: number;
  avgDesignHealth: number;
  improvementRate: number;
  currentStreak: number;
  bestDimension: EvaluationDimension;
  dimensionAverages: DimensionScore[];
  recentActivity: Array<{
    attemptId: string;
    problemTitle: string;
    attemptNumber: number;
    status: AttemptStatus;
    score?: number;
    date: string;
  }>;
}

export interface SecurityTelemetry {
  applicationSecurity: 'PROTECTED';
  secrets: 'PROTECTED';
  apiSecurity: 'PROTECTED';
  aiSecurity: 'PROTECTED';
  inputValidation: 'ACTIVE';
  rateLimiting: 'ACTIVE';
  lastSecurityScan: string;
  recentSecurityEvents: Array<{
    id: string;
    type: string;
    status: string;
    timestamp: string;
    details: string;
  }>;
}
