import { z } from 'zod';

// Base sanitized string schema with reasonable bounds
export const safeIdentifierRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const safeNameSchema = z.string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or less')
  .refine(val => safeIdentifierRegex.test(val), {
    message: 'Identifier must start with a letter or underscore and contain only alphanumeric characters or underscores'
  });

export const safeTextSchema = z.string()
  .trim()
  .max(2000, 'Text content must not exceed 2000 characters');

export const attributeSchema = z.object({
  name: safeNameSchema,
  type: z.string().trim().min(1).max(80),
  visibility: z.enum(['public', 'private', 'protected']).default('private')
});

export const methodParameterSchema = z.object({
  name: safeNameSchema,
  type: z.string().trim().min(1).max(80)
});

export const methodSchema = z.object({
  name: safeNameSchema,
  returnType: z.string().trim().min(1).max(80),
  parameters: z.array(methodParameterSchema).max(10, 'Max 10 parameters allowed per method'),
  visibility: z.enum(['public', 'private', 'protected']).default('public')
});

export const classSchema = z.object({
  name: safeNameSchema,
  responsibility: z.string().trim().min(3, 'Responsibility description is required').max(500),
  attributes: z.array(attributeSchema).max(30, 'Maximum 30 attributes per class'),
  methods: z.array(methodSchema).max(30, 'Maximum 30 methods per class')
});

export const interfaceSchema = z.object({
  name: safeNameSchema,
  description: z.string().trim().max(500).optional(),
  methods: z.array(methodSchema).min(1, 'Interfaces must define at least one method').max(20)
});

export const relationshipTypeSchema = z.enum([
  'INHERITANCE',
  'COMPOSITION',
  'AGGREGATION',
  'DEPENDENCY',
  'IMPLEMENTATION'
]);

export const relationshipSchema = z.object({
  source: safeNameSchema,
  target: safeNameSchema,
  type: relationshipTypeSchema,
  label: z.string().trim().max(100).optional()
}).refine(data => data.source !== data.target, {
  message: 'Self-referential relationships require a separate hierarchical pattern'
});

export const patternChoiceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(3).max(500),
  tradeoff: z.string().trim().min(3).max(500)
});

export const structuredDesignSchema = z.object({
  assumptions: z.array(safeTextSchema).max(20, 'Maximum 20 assumptions allowed'),
  classes: z.array(classSchema).min(1, 'Design must define at least one class').max(50, 'Maximum 50 classes allowed'),
  interfaces: z.array(interfaceSchema).max(30, 'Maximum 30 interfaces allowed'),
  relationships: z.array(relationshipSchema).max(80, 'Maximum 80 relationships allowed'),
  patterns: z.array(patternChoiceSchema).max(15, 'Maximum 15 patterns allowed'),
  tradeoffs: z.array(safeTextSchema).max(20, 'Maximum 20 trade-offs allowed'),
  edgeCases: z.array(safeTextSchema).max(20, 'Maximum 20 edge cases allowed')
});

// Draft submission schema allows partial designs for autosaving
export const draftDesignSchema = z.object({
  assumptions: z.array(safeTextSchema).max(20).default([]),
  classes: z.array(classSchema.partial({ responsibility: true, attributes: true, methods: true })).max(50).default([]),
  interfaces: z.array(interfaceSchema.partial({ methods: true })).max(30).default([]),
  relationships: z.array(relationshipSchema).max(80).default([]),
  patterns: z.array(patternChoiceSchema).max(15).default([]),
  tradeoffs: z.array(safeTextSchema).max(20).default([]),
  edgeCases: z.array(safeTextSchema).max(20).default([])
});

export const breakMyDesignInputSchema = z.object({
  affectedClasses: z.array(safeNameSchema).max(20),
  affectedInterfaces: z.array(safeNameSchema).max(20),
  requiredChanges: z.array(safeTextSchema).min(1, 'Please specify at least one required architectural change').max(15),
  reasoning: z.string().trim().min(10, 'Please explain your architectural reasoning').max(2000),
  tradeoffs: z.array(safeTextSchema).max(10)
});

export const evaluationDimensionSchema = z.enum([
  'Requirement Understanding',
  'Responsibility Assignment',
  'Coupling',
  'Cohesion',
  'Encapsulation',
  'Interfaces',
  'Abstraction',
  'Pattern Fit',
  'Extensibility',
  'Edge Cases',
  'Testability',
  'Explanation Quality'
]);

export const evaluationRatingSchema = z.enum([
  'CRITICAL',
  'NEEDS ATTENTION',
  'GOOD',
  'STRONG'
]);

export const evaluationCriterionResultSchema = z.object({
  dimension: evaluationDimensionSchema,
  score: z.number().min(0).max(10),
  status: evaluationRatingSchema,
  evidence: z.string().trim().min(1).max(1000),
  concern: z.string().trim().min(1).max(1000),
  suggestion: z.string().trim().min(1).max(1000),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH'])
});

export const dimensionScoreSchema = z.object({
  dimension: evaluationDimensionSchema,
  score: z.number().min(0).max(10),
  maxScore: z.number().default(10)
});

// Strict schema for AI / Evaluator response validation
export const evaluationResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  rating: evaluationRatingSchema,
  seniorReviewSummary: z.string().trim().min(20).max(3000),
  topRecommendations: z.array(z.string().trim().min(5).max(500)).min(1).max(5),
  dimensionScores: z.array(dimensionScoreSchema).length(12, 'Evaluation must cover all 12 dimensions exactly'),
  criterionResults: z.array(evaluationCriterionResultSchema).length(12, 'Must include 12 criteria results'),
  evaluatorType: z.enum(['DEMO', 'AI', 'DETERMINISTIC']),
  evaluatedAt: z.string()
});
