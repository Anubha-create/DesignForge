import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/problems - List all problems with user attempt metrics
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const problemsWithStats = await Promise.all(
      problems.map(async (prob) => {
        const attempts = await prisma.attempt.findMany({
          where: { problemId: prob.id, userId },
          include: { evaluation: true },
          orderBy: { attemptNumber: 'asc' }
        });

        const completedAttempts = attempts.filter(a => a.status === 'COMPLETED' && a.evaluation);
        const scores = completedAttempts.map(a => a.evaluation!.overallScore);
        const bestScore = scores.length > 0 ? Math.max(...scores) : null;
        
        let improvementPercent: number | null = null;
        if (scores.length >= 2) {
          const first = scores[0];
          const latest = scores[scores.length - 1];
          improvementPercent = Math.round(((latest - first) / (first || 1)) * 100);
        }

        return {
          id: prob.id,
          title: prob.title,
          slug: prob.slug,
          difficulty: prob.difficulty,
          estimatedTime: prob.estimatedTime,
          summary: prob.summary,
          suggestedConcepts: JSON.parse(prob.suggestedConcepts),
          attemptsCount: attempts.length,
          bestScore,
          improvementPercent,
          status: completedAttempts.length > 0 ? 'SOLVED' : attempts.length > 0 ? 'IN_PROGRESS' : 'UNTOUCHED'
        };
      })
    );

    res.json({ problems: problemsWithStats });
  } catch (err) {
    next(err);
  }
});

// GET /api/problems/:slugOrId - Problem details
router.get('/:slugOrId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugOrId = String(req.params.slugOrId);
    const problem = await prisma.problem.findFirst({
      where: {
        OR: [
          { id: slugOrId },
          { slug: slugOrId }
        ]
      }
    });

    if (!problem) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Problem '${slugOrId}' not found.` }
      });
    }

    res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        estimatedTime: problem.estimatedTime,
        summary: problem.summary,
        problemStatement: problem.problemStatement,
        functionalRequirements: JSON.parse(problem.functionalRequirements),
        designExpectations: JSON.parse(problem.designExpectations),
        constraints: JSON.parse(problem.constraints),
        edgeCases: JSON.parse(problem.edgeCases),
        clarifyingQuestions: JSON.parse(problem.clarifyingQuestions),
        suggestedConcepts: JSON.parse(problem.suggestedConcepts),
        hiddenRubricNotes: JSON.parse(problem.hiddenRubricNotes),
        requirementChange: JSON.parse(problem.requirementChange),
        createdAt: problem.createdAt,
        updatedAt: problem.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
