import { 
  Problem, 
  AttemptDetail, 
  StructuredDesign, 
  EvaluationResult, 
  DesignDiff, 
  BreakMyDesignInput, 
  BreakMyDesignEvaluation, 
  DashboardStats, 
  SecurityTelemetry 
} from '@designforge/shared';

const API_BASE = '/api';

class ApiError extends Error {
  code: string;
  requestId?: string;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', requestId?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data.error || {};
    throw new ApiError(
      err.message || `Request failed with status ${response.status}`,
      err.code || 'HTTP_ERROR',
      err.requestId,
      err.details || err.issues
    );
  }

  return data;
}

export const api = {
  // Problems
  getProblems: async (): Promise<{ problems: any[] }> => {
    return request<{ problems: any[] }>('/problems');
  },

  getProblem: async (slugOrId: string): Promise<{ problem: Problem }> => {
    return request<{ problem: Problem }>(`/problems/${slugOrId}`);
  },

  // Attempts
  createAttempt: async (problemId: string, cloneFromPrevious: boolean = false): Promise<{ attempt: any }> => {
    return request<{ attempt: any }>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ problemId, cloneFromPrevious })
    });
  },

  getAttempt: async (id: string): Promise<{ attempt: AttemptDetail }> => {
    return request<{ attempt: AttemptDetail }>(`/attempts/${id}`);
  },

  saveSubmission: async (attemptId: string, design: StructuredDesign): Promise<{ success: boolean; completenessScore: number }> => {
    return request<{ success: boolean; completenessScore: number }>(`/attempts/${attemptId}/submission`, {
      method: 'PUT',
      body: JSON.stringify({ design })
    });
  },

  submitDesign: async (attemptId: string): Promise<{ success: boolean; status: string }> => {
    return request<{ success: boolean; status: string }>(`/attempts/${attemptId}/submit`, {
      method: 'POST'
    });
  },

  evaluateAttempt: async (attemptId: string): Promise<{ success: boolean; evaluation: EvaluationResult }> => {
    return request<{ success: boolean; evaluation: EvaluationResult }>(`/attempts/${attemptId}/evaluate`, {
      method: 'POST'
    });
  },

  getAttemptHistory: async (attemptId: string): Promise<{ history: any[] }> => {
    return request<{ history: any[] }>(`/attempts/${attemptId}/history`);
  },

  compareAttempts: async (id1: string, id2: string): Promise<{ diff: DesignDiff }> => {
    return request<{ diff: DesignDiff }>(`/attempts/compare/${id1}/${id2}`);
  },

  breakMyDesign: async (attemptId: string, input: BreakMyDesignInput): Promise<{ success: boolean; resilience: BreakMyDesignEvaluation }> => {
    return request<{ success: boolean; resilience: BreakMyDesignEvaluation }>(`/attempts/${attemptId}/change-test`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Dashboard & Security
  getDashboard: async (): Promise<{ stats: DashboardStats }> => {
    return request<{ stats: DashboardStats }>('/dashboard');
  },

  getSecurityStatus: async (): Promise<{ security: SecurityTelemetry }> => {
    return request<{ security: SecurityTelemetry }>('/security/status');
  }
};
