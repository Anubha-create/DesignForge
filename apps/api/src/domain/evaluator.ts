import { Problem, StructuredDesign, EvaluationResult } from '@designforge/shared';

export interface EvaluationInput {
  problem: Problem;
  design: StructuredDesign;
  attemptNumber: number;
  previousEvaluations?: EvaluationResult[];
}

export interface Evaluator {
  evaluate(input: EvaluationInput): Promise<EvaluationResult>;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'WARNING' | 'ERROR';
}

export interface DeterministicValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}
