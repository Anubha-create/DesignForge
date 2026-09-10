import { describe, it, expect } from 'vitest';
import { DeterministicEvaluator } from '../evaluators/deterministicEvaluator.js';
import { DemoEvaluator } from '../evaluators/demoEvaluator.js';
import { DiffEngine } from '../services/diffEngine.js';
import { ResilienceEngine } from '../services/resilienceEngine.js';
import { StructuredDesign, EvaluationResult } from '@designforge/shared';

describe('Domain Evaluator Tests', () => {
  const validDesign: StructuredDesign = {
    assumptions: ['Single location', 'Concurrent vehicles'],
    classes: [
      {
        name: 'ParkingLot',
        responsibility: 'Orchestrates entry and exit dispatching.',
        attributes: [{ name: 'capacity', type: 'number', visibility: 'private' }],
        methods: [{ name: 'park', returnType: 'Ticket', parameters: [], visibility: 'public' }]
      },
      {
        name: 'ParkingSpot',
        responsibility: 'Represents atomic parking slot.',
        attributes: [{ name: 'isFree', type: 'boolean', visibility: 'private' }],
        methods: [{ name: 'occupy', returnType: 'void', parameters: [], visibility: 'public' }]
      }
    ],
    interfaces: [
      {
        name: 'PricingStrategy',
        methods: [{ name: 'calc', returnType: 'number', parameters: [], visibility: 'public' }]
      }
    ],
    relationships: [
      { source: 'ParkingLot', target: 'ParkingSpot', type: 'COMPOSITION' },
      { source: 'ParkingLot', target: 'PricingStrategy', type: 'DEPENDENCY' }
    ],
    patterns: [{ name: 'Strategy', reason: 'Decouple pricing', tradeoff: 'Extra interface' }],
    tradeoffs: ['Modularized at the expense of extra interfaces'],
    edgeCases: ['Full lot']
  };

  it('DeterministicEvaluator: accepts structurally sound design', () => {
    const res = DeterministicEvaluator.validate(validDesign);
    expect(res.isValid).toBe(true);
    expect(res.issues.filter(i => i.severity === 'ERROR')).toHaveLength(0);
  });

  it('DeterministicEvaluator: rejects design with no classes', () => {
    const invalidDesign: StructuredDesign = {
      ...validDesign,
      classes: []
    };
    const res = DeterministicEvaluator.validate(invalidDesign);
    expect(res.isValid).toBe(false);
    expect(res.issues.some(i => i.field === 'classes')).toBe(true);
  });

  it('DeterministicEvaluator: rejects duplicate class names', () => {
    const invalidDesign: StructuredDesign = {
      ...validDesign,
      classes: [
        { name: 'Vehicle', responsibility: 'Car entity', attributes: [], methods: [] },
        { name: 'Vehicle', responsibility: 'Bike entity', attributes: [], methods: [] }
      ]
    };
    const res = DeterministicEvaluator.validate(invalidDesign);
    expect(res.isValid).toBe(false);
    expect(res.issues.some(i => i.message.includes('Duplicate class identifier'))).toBe(true);
  });

  it('DeterministicEvaluator: rejects relationship with invalid target', () => {
    const invalidDesign: StructuredDesign = {
      ...validDesign,
      relationships: [
        { source: 'ParkingLot', target: 'NonExistentEntity', type: 'DEPENDENCY' }
      ]
    };
    const res = DeterministicEvaluator.validate(invalidDesign);
    expect(res.isValid).toBe(false);
    expect(res.issues.some(i => i.message.includes('NonExistentEntity'))).toBe(true);
  });

  it('DemoEvaluator: evaluates 12 dimensions and returns senior review', async () => {
    const evaluator = new DemoEvaluator();
    const result = await evaluator.evaluate({
      problem: {
        id: 'p1',
        title: 'Parking Lot',
        slug: 'parking-lot',
        difficulty: 'MEDIUM',
        estimatedTime: '25 MIN',
        summary: 'Test summary',
        problemStatement: 'Test statement',
        functionalRequirements: ['Req 1'],
        designExpectations: ['Exp 1'],
        constraints: ['Con 1'],
        edgeCases: ['Edge 1'],
        clarifyingQuestions: [],
        suggestedConcepts: [],
        hiddenRubricNotes: [],
        requirementChange: {
          id: 'rc1',
          title: 'EV Charging',
          scenario: 'EV stations',
          newRequirement: 'Support EV',
          architecturalImpactHint: 'Extend spot',
          edgeCases: []
        }
      },
      design: validDesign,
      attemptNumber: 1
    });

    expect(result.overallScore).toBeGreaterThan(50);
    expect(result.dimensionScores).toHaveLength(12);
    expect(result.criterionResults).toHaveLength(12);
    expect(result.seniorReviewSummary).toBeDefined();
    expect(result.topRecommendations.length).toBeGreaterThanOrEqual(1);
  });

  it('DiffEngine: detects added classes and score improvements between attempts', () => {
    const prevEval: EvaluationResult = {
      overallScore: 65,
      rating: 'NEEDS ATTENTION',
      seniorReviewSummary: 'Previous review',
      topRecommendations: ['Fix coupling'],
      dimensionScores: [
        { dimension: 'Coupling', score: 5, maxScore: 10 },
        { dimension: 'Cohesion', score: 6, maxScore: 10 }
      ],
      criterionResults: [],
      evaluatorType: 'DEMO',
      evaluatedAt: new Date().toISOString()
    };

    const currEval: EvaluationResult = {
      overallScore: 82,
      rating: 'STRONG',
      seniorReviewSummary: 'Improved review',
      topRecommendations: ['Add telemetry'],
      dimensionScores: [
        { dimension: 'Coupling', score: 8, maxScore: 10 },
        { dimension: 'Cohesion', score: 8.5, maxScore: 10 }
      ],
      criterionResults: [],
      evaluatorType: 'DEMO',
      evaluatedAt: new Date().toISOString()
    };

    const diff = DiffEngine.compare(
      'att-1', 1, validDesign, prevEval,
      'att-2', 2, {
        ...validDesign,
        classes: [
          ...validDesign.classes,
          { name: 'VehicleFactory', responsibility: 'Creates vehicles', attributes: [], methods: [] }
        ]
      }, currEval
    );

    expect(diff.scoreDelta).toBe(17);
    expect(diff.addedClasses).toContain('VehicleFactory');
    expect(diff.verdict).toBe('IMPROVED');
  });

  it('ResilienceEngine: evaluates Break My Design resilience score', () => {
    const challenge = {
      id: 'rc1',
      title: 'EV Charging Stations',
      scenario: 'EV charging hardware required',
      newRequirement: 'Add EV spots with charging telemetry',
      architecturalImpactHint: 'Extend ParkingSpot',
      edgeCases: ['Non-EV parked in EV bay']
    };

    const multiClassDesign: StructuredDesign = {
      ...validDesign,
      classes: [
        ...validDesign.classes,
        { name: 'Vehicle', responsibility: 'Represents vehicles', attributes: [], methods: [] },
        { name: 'Ticket', responsibility: 'Represents ticket record', attributes: [], methods: [] }
      ]
    };

    const result = ResilienceEngine.evaluateResilience(multiClassDesign, challenge, {
      affectedClasses: ['ParkingSpot'],
      affectedInterfaces: [],
      requiredChanges: ['Subclass ParkingSpot to create ElectricParkingSpot with meter telemetry'],
      reasoning: 'By subclassing or composing ElectricParkingSpot, we preserve the existing ParkingSpot contract and ParkingLot allocation loops without modification.',
      tradeoffs: ['Requires telemetry polling adapter']
    });

    expect(result.resilienceScore).toBeGreaterThanOrEqual(80);
    expect(result.couplingImpact).toBe('LOW');
    expect(result.modificationVsExtension).toContain('Open/Closed Principle');
  });
});
