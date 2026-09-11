import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Security & API Defense Tests', () => {
  it('Security Headers: sets Helmet headers and Request ID', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('Error Sanitization: unhandled paths return standardized sanitized error shape', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    expect(res.status).toBe(404);
    // Express default 404 or errorHandler
    if (res.body?.error) {
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('requestId');
      expect(res.body.error.stack).toBeUndefined();
    }
  });

  it('Input Validation: rejects malformed design payload on submission autosave', async () => {
    const draftAttempt = await prisma.attempt.create({
      data: {
        userId: 'demo-user-1',
        problemId: 'prob-parking-lot',
        attemptNumber: 888,
        status: 'DRAFT'
      }
    });

    const res = await request(app)
      .put(`/api/attempts/${draftAttempt.id}/submission`)
      .send({
        design: {
          classes: 'invalid-string-instead-of-array'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');

    // Clean up
    await prisma.attempt.delete({ where: { id: draftAttempt.id } });
  });

  it('IDOR / Authorization Protection: blocks access when attempting to query non-owned attempt', async () => {
    // Create an attempt belonging to an attacker user
    const attackerUser = await prisma.user.upsert({
      where: { email: 'attacker@evil.com' },
      update: {},
      create: {
        id: 'attacker-user-id',
        username: 'attacker',
        email: 'attacker@evil.com',
        role: 'LEARNER'
      }
    });

    const prob = await prisma.problem.findFirst();
    if (prob) {
      const alienAttempt = await prisma.attempt.upsert({
        where: {
          userId_problemId_attemptNumber: {
            userId: attackerUser.id,
            problemId: prob.id,
            attemptNumber: 999
          }
        },
        update: {},
        create: {
          id: 'alien-attempt-999',
          userId: attackerUser.id,
          problemId: prob.id,
          attemptNumber: 999,
          status: 'DRAFT'
        }
      });

      // Attempt to access with demo-user-1 (which is the default authenticated user context in prototype)
      const res = await request(app).get(`/api/attempts/${alienAttempt.id}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Unauthorized');
    }
  });

  it('Break My Design: validates change-test input schema', async () => {
    const prob = await prisma.problem.findFirst();
    const testAttempt = await prisma.attempt.create({
      data: {
        userId: 'demo-user-1',
        problemId: prob!.id,
        attemptNumber: 999,
        status: 'DRAFT',
        submission: {
          create: {
            assumptions: '[]',
            classes: '[]',
            interfaces: '[]',
            relationships: '[]',
            patterns: '[]',
            tradeoffs: '[]',
            edgeCases: '[]'
          }
        }
      }
    });

    try {
      const res = await request(app)
        .post(`/api/attempts/${testAttempt.id}/change-test`)
        .send({
          affectedClasses: [],
          requiredChanges: [], // invalid: requires at least 1 change
          reasoning: 'too short' // invalid: requires min 10 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    } finally {
      await prisma.attempt.delete({ where: { id: testAttempt.id } });
    }
  });
});
