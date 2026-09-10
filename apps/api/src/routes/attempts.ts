import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  draftDesignSchema, 
  structuredDesignSchema, 
  breakMyDesignInputSchema, 
  StructuredDesign,
  EvaluationResult,
  AttemptDetail 
} from '@designforge/shared';
import { DeterministicEvaluator } from '../evaluators/deterministicEvaluator.js';
import { EvaluatorFactory } from '../evaluators/evaluatorFactory.js';
import { DiffEngine } from '../services/diffEngine.js';
import { ResilienceEngine } from '../services/resilienceEngine.js';
import { evaluationRateLimiter } from '../middleware/security.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to calculate design completeness score (0-100)
function calculateCompleteness(design: StructuredDesign): number {
  let score = 0;
  if (design.assumptions && design.assumptions.length > 0) score += 15;
  if (design.classes && design.classes.length > 0) {
    score += 35;
    const hasMethods = design.classes.some(c => c.methods && c.methods.length > 0);
    const hasAttributes = design.classes.some(c => c.attributes && c.attributes.length > 0);
    if (hasMethods && hasAttributes) score += 10;
  }
  if (design.interfaces && design.interfaces.length > 0) score += 15;
  if (design.relationships && design.relationships.length > 0) score += 10;
  if (design.patterns && design.patterns.length > 0) score += 5;
  if (design.tradeoffs && design.tradeoffs.length > 0) score += 5;
  if (design.edgeCases && design.edgeCases.length > 0) score += 5;
  return Math.min(100, score);
}

// POST /api/attempts - Create a new attempt for a problem
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'problemId is required' }
      });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Problem not found' }
      });
    }

    // Get max attempt number for this user and problem
    const lastAttempt = await prisma.attempt.findFirst({
      where: { userId, problemId },
      orderBy: { attemptNumber: 'desc' }
    });
    const nextAttemptNumber = (lastAttempt?.attemptNumber || 0) + 1;

    // Optional: seed initial draft template from previous attempt if requested
    let initialDesign: StructuredDesign = {
      assumptions: [],
      classes: [],
      interfaces: [],
      relationships: [],
      patterns: [],
      tradeoffs: [],
      edgeCases: []
    };

    if (lastAttempt && req.body.cloneFromPrevious) {
      const prevSub = await prisma.submission.findUnique({ where: { attemptId: lastAttempt.id } });
      if (prevSub) {
        initialDesign = {
          assumptions: JSON.parse(prevSub.assumptions),
          classes: JSON.parse(prevSub.classes),
          interfaces: JSON.parse(prevSub.interfaces),
          relationships: JSON.parse(prevSub.relationships),
          patterns: JSON.parse(prevSub.patterns),
          tradeoffs: JSON.parse(prevSub.tradeoffs),
          edgeCases: JSON.parse(prevSub.edgeCases)
        };
      }
    }

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        problemId,
        attemptNumber: nextAttemptNumber,
        status: 'DRAFT',
        submission: {
          create: {
            assumptions: JSON.stringify(initialDesign.assumptions),
            classes: JSON.stringify(initialDesign.classes),
            interfaces: JSON.stringify(initialDesign.interfaces),
            relationships: JSON.stringify(initialDesign.relationships),
            patterns: JSON.stringify(initialDesign.patterns),
            tradeoffs: JSON.stringify(initialDesign.tradeoffs),
            edgeCases: JSON.stringify(initialDesign.edgeCases),
            completenessScore: calculateCompleteness(initialDesign)
          }
        }
      },
      include: {
        problem: true,
        submission: true
      }
    });

    res.status(201).json({ attempt });
  } catch (err) {
    next(err);
  }
});

// GET /api/attempts/:id - Fetch attempt detail with ownership authorization
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id = String(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        problem: true,
        submission: true,
        evaluation: {
          include: {
            criterionResults: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Attempt not found' }
      });
    }

    // Ownership authorization check (prevents IDOR/BOLA)
    if (attempt.userId !== userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Unauthorized: Access to this attempt is restricted to its owner.' }
      });
    }

    let parsedSubmission = null;
    if (attempt.submission) {
      parsedSubmission = {
        id: attempt.submission.id,
        completenessScore: attempt.submission.completenessScore,
        updatedAt: attempt.submission.updatedAt.toISOString(),
        design: {
          assumptions: JSON.parse(attempt.submission.assumptions),
          classes: JSON.parse(attempt.submission.classes),
          interfaces: JSON.parse(attempt.submission.interfaces),
          relationships: JSON.parse(attempt.submission.relationships),
          patterns: JSON.parse(attempt.submission.patterns),
          tradeoffs: JSON.parse(attempt.submission.tradeoffs),
          edgeCases: JSON.parse(attempt.submission.edgeCases)
        }
      };
    }

    let parsedEvaluation: EvaluationResult | null = null;
    if (attempt.evaluation) {
      parsedEvaluation = {
        overallScore: attempt.evaluation.overallScore,
        rating: attempt.evaluation.rating as any,
        seniorReviewSummary: attempt.evaluation.seniorReviewSummary,
        topRecommendations: JSON.parse(attempt.evaluation.topRecommendations),
        dimensionScores: JSON.parse(attempt.evaluation.dimensionScores),
        evaluatorType: attempt.evaluation.evaluatorType as any,
        evaluatedAt: attempt.evaluation.evaluatedAt.toISOString(),
        criterionResults: attempt.evaluation.criterionResults.map(c => ({
          dimension: c.dimension as any,
          score: c.score,
          status: c.status as any,
          evidence: c.evidence,
          concern: c.concern,
          suggestion: c.suggestion,
          confidence: c.confidence as any
        }))
      };
    }

    const detail: AttemptDetail = {
      id: attempt.id,
      problemId: attempt.problemId,
      problemTitle: attempt.problem.title,
      problemSlug: attempt.problem.slug,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status as any,
      submission: parsedSubmission,
      evaluation: parsedEvaluation,
      createdAt: attempt.createdAt.toISOString(),
      updatedAt: attempt.updatedAt.toISOString()
    };

    res.json({ attempt: detail });
  } catch (err) {
    next(err);
  }
});

// PUT /api/attempts/:id/submission - Autosave draft design
router.put('/:id/submission', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id = String(req.params.id);

    const attempt = await prisma.attempt.findUnique({ where: { id } });
    if (!attempt) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
    }

    if (attempt.userId !== userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    if (attempt.status === 'COMPLETED' || attempt.status === 'EVALUATING') {
      return res.status(400).json({
        error: { code: 'ILLEGAL_STATE', message: 'Cannot modify an attempt that is already evaluating or completed.' }
      });
    }

    // Validate payload with draft schema
    const validatedData = draftDesignSchema.parse(req.body.design || req.body);
    const completeness = calculateCompleteness(validatedData as any);

    const submission = await prisma.submission.upsert({
      where: { attemptId: id },
      update: {
        assumptions: JSON.stringify(validatedData.assumptions),
        classes: JSON.stringify(validatedData.classes),
        interfaces: JSON.stringify(validatedData.interfaces),
        relationships: JSON.stringify(validatedData.relationships),
        patterns: JSON.stringify(validatedData.patterns),
        tradeoffs: JSON.stringify(validatedData.tradeoffs),
        edgeCases: JSON.stringify(validatedData.edgeCases),
        completenessScore: completeness
      },
      create: {
        attemptId: id,
        assumptions: JSON.stringify(validatedData.assumptions),
        classes: JSON.stringify(validatedData.classes),
        interfaces: JSON.stringify(validatedData.interfaces),
        relationships: JSON.stringify(validatedData.relationships),
        patterns: JSON.stringify(validatedData.patterns),
        tradeoffs: JSON.stringify(validatedData.tradeoffs),
        edgeCases: JSON.stringify(validatedData.edgeCases),
        completenessScore: completeness
      }
    });

    res.json({
      success: true,
      submissionId: submission.id,
      completenessScore: completeness,
      updatedAt: submission.updatedAt
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/attempts/:id/submit - Lock submission into SUBMITTED state
router.post('/:id/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id = String(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: { submission: true }
    });

    if (!attempt) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
    if (attempt.userId !== userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    if (!attempt.submission) {
      return res.status(400).json({ error: { code: 'EMPTY_SUBMISSION', message: 'Cannot submit without a design draft' } });
    }

    const updated = await prisma.attempt.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    res.json({ success: true, status: updated.status });
  } catch (err) {
    next(err);
  }
});

// POST /api/attempts/:id/evaluate - Deterministic checks + Evaluator execution
router.post('/:id/evaluate', evaluationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id = String(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        problem: true,
        submission: true,
        evaluation: true
      }
    });

    if (!attempt) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
    if (attempt.userId !== userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    // Idempotency check: if evaluation already completed, return existing evaluation
    if (attempt.status === 'COMPLETED' && attempt.evaluation) {
      return res.json({
        message: 'Evaluation already completed for this attempt.',
        evaluationId: attempt.evaluation.id
      });
    }

    if (attempt.status === 'EVALUATING') {
      return res.status(409).json({
        error: { code: 'CONCURRENT_EVALUATION', message: 'Evaluation is currently in progress for this attempt.' }
      });
    }

    if (!attempt.submission) {
      return res.status(400).json({
        error: { code: 'EMPTY_DESIGN', message: 'Cannot evaluate an empty submission.' }
      });
    }

    // Parse design
    const design: StructuredDesign = {
      assumptions: JSON.parse(attempt.submission.assumptions),
      classes: JSON.parse(attempt.submission.classes),
      interfaces: JSON.parse(attempt.submission.interfaces),
      relationships: JSON.parse(attempt.submission.relationships),
      patterns: JSON.parse(attempt.submission.patterns),
      tradeoffs: JSON.parse(attempt.submission.tradeoffs),
      edgeCases: JSON.parse(attempt.submission.edgeCases)
    };

    // Step 1: Run Deterministic Evaluator
    const deterministicResult = DeterministicEvaluator.validate(design);
    if (!deterministicResult.isValid) {
      return res.status(422).json({
        error: {
          code: 'DETERMINISTIC_VALIDATION_FAILED',
          message: 'Design has structural errors that must be resolved before evaluation.',
          issues: deterministicResult.issues
        }
      });
    }

    // Transition state to EVALUATING
    await prisma.attempt.update({
      where: { id },
      data: { status: 'EVALUATING' }
    });

    // Format problem spec
    const problemSpec = {
      id: attempt.problem.id,
      title: attempt.problem.title,
      slug: attempt.problem.slug,
      difficulty: attempt.problem.difficulty as any,
      estimatedTime: attempt.problem.estimatedTime,
      summary: attempt.problem.summary,
      problemStatement: attempt.problem.problemStatement,
      functionalRequirements: JSON.parse(attempt.problem.functionalRequirements),
      designExpectations: JSON.parse(attempt.problem.designExpectations),
      constraints: JSON.parse(attempt.problem.constraints),
      edgeCases: JSON.parse(attempt.problem.edgeCases),
      clarifyingQuestions: JSON.parse(attempt.problem.clarifyingQuestions),
      suggestedConcepts: JSON.parse(attempt.problem.suggestedConcepts),
      hiddenRubricNotes: JSON.parse(attempt.problem.hiddenRubricNotes),
      requirementChange: JSON.parse(attempt.problem.requirementChange)
    };

    try {
      // Step 2: Run Pluggable Evaluator
      const evaluator = EvaluatorFactory.getEvaluator();
      const evalResult = await evaluator.evaluate({
        problem: problemSpec,
        design,
        attemptNumber: attempt.attemptNumber
      });

      // Step 3: Persist Evaluation and DesignSnapshot in a transaction
      await prisma.$transaction(async (tx) => {
        // Save Snapshot
        await tx.designSnapshot.upsert({
          where: { attemptId: id },
          update: {
            serializedDesign: JSON.stringify(design),
            classCount: design.classes.length,
            interfaceCount: design.interfaces.length,
            relationshipCount: design.relationships.length
          },
          create: {
            attemptId: id,
            serializedDesign: JSON.stringify(design),
            classCount: design.classes.length,
            interfaceCount: design.interfaces.length,
            relationshipCount: design.relationships.length
          }
        });

        // Delete old evaluation if any
        await tx.evaluation.deleteMany({ where: { attemptId: id } });

        // Create Evaluation
        await tx.evaluation.create({
          data: {
            attemptId: id,
            overallScore: evalResult.overallScore,
            rating: evalResult.rating,
            seniorReviewSummary: evalResult.seniorReviewSummary,
            topRecommendations: JSON.stringify(evalResult.topRecommendations),
            dimensionScores: JSON.stringify(evalResult.dimensionScores),
            evaluatorType: evalResult.evaluatorType,
            evaluatedAt: new Date(evalResult.evaluatedAt),
            criterionResults: {
              create: evalResult.criterionResults.map(c => ({
                dimension: c.dimension,
                score: c.score,
                status: c.status,
                evidence: c.evidence,
                concern: c.concern,
                suggestion: c.suggestion,
                confidence: c.confidence
              }))
            }
          }
        });

        // Update Attempt status to COMPLETED
        await tx.attempt.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });
      });

      res.json({
        success: true,
        evaluation: evalResult
      });
    } catch (evalErr: any) {
      // Fail safely: Never lose user work
      await prisma.attempt.update({
        where: { id },
        data: {
          status: 'FAILED',
          failureReason: evalErr.message || 'Evaluation failed safely'
        }
      });

      return res.status(500).json({
        error: {
          code: 'EVALUATION_FAILED',
          message: 'Evaluation failed safely. Your draft design remains saved. Please retry evaluation.',
          details: evalErr.message
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/attempts/:id/history - Retrieve all attempts for the same problem
router.get('/:id/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id = String(req.params.id);

    const currentAttempt = await prisma.attempt.findUnique({ where: { id } });
    if (!currentAttempt) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
    if (currentAttempt.userId !== userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        problemId: currentAttempt.problemId
      },
      include: {
        evaluation: true
      },
      orderBy: { attemptNumber: 'asc' }
    });

    const history = attempts.map(a => ({
      id: a.id,
      attemptNumber: a.attemptNumber,
      status: a.status,
      overallScore: a.evaluation?.overallScore || null,
      rating: a.evaluation?.rating || null,
      createdAt: a.createdAt.toISOString()
    }));

    res.json({ history });
  } catch (err) {
    next(err);
  }
});

// GET /api/attempts/compare/:id1/:id2 - Git-style architectural diff
router.get('/compare/:id1/:id2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id1 = String(req.params.id1);
    const id2 = String(req.params.id2);

    const att1 = await prisma.attempt.findUnique({
      where: { id: id1 },
      include: { submission: true, evaluation: true }
    });
    const att2 = await prisma.attempt.findUnique({
      where: { id: id2 },
      include: { submission: true, evaluation: true }
    });

    if (!att1 || !att2) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'One or both attempts not found.' } });
    }

    if (att1.userId !== userId || att2.userId !== userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied.' } });
    }

    if (!att1.submission || !att2.submission || !att1.evaluation || !att2.evaluation) {
      return res.status(400).json({
        error: { code: 'INCOMPLETE_ATTEMPTS', message: 'Both attempts must be submitted and evaluated for diffing.' }
      });
    }

    const design1: StructuredDesign = {
      assumptions: JSON.parse(att1.submission.assumptions),
      classes: JSON.parse(att1.submission.classes),
      interfaces: JSON.parse(att1.submission.interfaces),
      relationships: JSON.parse(att1.submission.relationships),
      patterns: JSON.parse(att1.submission.patterns),
      tradeoffs: JSON.parse(att1.submission.tradeoffs),
      edgeCases: JSON.parse(att1.submission.edgeCases)
    };

    const design2: StructuredDesign = {
      assumptions: JSON.parse(att2.submission.assumptions),
      classes: JSON.parse(att2.submission.classes),
      interfaces: JSON.parse(att2.submission.interfaces),
      relationships: JSON.parse(att2.submission.relationships),
      patterns: JSON.parse(att2.submission.patterns),
      tradeoffs: JSON.parse(att2.submission.tradeoffs),
      edgeCases: JSON.parse(att2.submission.edgeCases)
    };

    const eval1: EvaluationResult = {
      overallScore: att1.evaluation.overallScore,
      rating: att1.evaluation.rating as any,
      seniorReviewSummary: att1.evaluation.seniorReviewSummary,
      topRecommendations: JSON.parse(att1.evaluation.topRecommendations),
      dimensionScores: JSON.parse(att1.evaluation.dimensionScores),
      criterionResults: [],
      evaluatorType: att1.evaluation.evaluatorType as any,
      evaluatedAt: att1.evaluation.evaluatedAt.toISOString()
    };

    const eval2: EvaluationResult = {
      overallScore: att2.evaluation.overallScore,
      rating: att2.evaluation.rating as any,
      seniorReviewSummary: att2.evaluation.seniorReviewSummary,
      topRecommendations: JSON.parse(att2.evaluation.topRecommendations),
      dimensionScores: JSON.parse(att2.evaluation.dimensionScores),
      criterionResults: [],
      evaluatorType: att2.evaluation.evaluatorType as any,
      evaluatedAt: att2.evaluation.evaluatedAt.toISOString()
    };

    const diff = DiffEngine.compare(
      att1.id,
      att1.attemptNumber,
      design1,
      eval1,
      att2.id,
      att2.attemptNumber,
      design2,
      eval2
    );

    res.json({ diff });
  } catch (err) {
    next(err);
  }
});

// POST /api/attempts/:id/change-test - "Break My Design" Resilience Test
router.post('/:id/change-test', evaluationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const id = String(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        problem: true,
        submission: true
      }
    });

    if (!attempt) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
    if (attempt.userId !== userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    if (!attempt.submission) {
      return res.status(400).json({ error: { code: 'EMPTY_DESIGN', message: 'Attempt has no design submission.' } });
    }

    const validatedInput = breakMyDesignInputSchema.parse(req.body);

    const design: StructuredDesign = {
      assumptions: JSON.parse(attempt.submission.assumptions),
      classes: JSON.parse(attempt.submission.classes),
      interfaces: JSON.parse(attempt.submission.interfaces),
      relationships: JSON.parse(attempt.submission.relationships),
      patterns: JSON.parse(attempt.submission.patterns),
      tradeoffs: JSON.parse(attempt.submission.tradeoffs),
      edgeCases: JSON.parse(attempt.submission.edgeCases)
    };

    const requirementChange = JSON.parse(attempt.problem.requirementChange);

    const result = ResilienceEngine.evaluateResilience(design, requirementChange, validatedInput);

    // Persist result
    const saved = await prisma.changeTestResult.create({
      data: {
        attemptId: id,
        resilienceScore: result.resilienceScore,
        rating: result.rating,
        affectedClassesCount: result.affectedClassesCount,
        affectedInterfacesCount: result.affectedInterfacesCount,
        newAbstractionsCount: result.newAbstractionsCount,
        couplingImpact: result.couplingImpact,
        extensibilityRating: result.extensibilityRating,
        modificationVsExtension: result.modificationVsExtension,
        regressionRisk: result.regressionRisk,
        evidence: JSON.stringify(result.evidence),
        verdictSummary: result.verdictSummary,
        recommendations: JSON.stringify(result.recommendations)
      }
    });

    res.json({
      success: true,
      resultId: saved.id,
      resilience: result
    });
  } catch (err) {
    next(err);
  }
});

export default router;
