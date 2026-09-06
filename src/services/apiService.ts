// ---------------------------------------------------------------------------
// apiService.ts — Client-side API caller for IdeaForge backend services
// ---------------------------------------------------------------------------

export interface DiagnosticServiceResult {
  status: 'healthy' | 'error';
  latencyMs?: number;
  model?: string;
  resultsCount?: number;
  sampleOutput?: string;
  sampleSource?: string;
  error?: string;
  message?: string;
  projectId?: string;
  authProviders?: string[];
}

export interface DiagnosticsResponse {
  timestamp: string;
  allHealthy: boolean;
  services: {
    gemini?: DiagnosticServiceResult;
    tavily?: DiagnosticServiceResult;
    firebase?: DiagnosticServiceResult;
    firestore?: DiagnosticServiceResult;
  };
}

export interface EvidenceSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevanceScore?: number;
}

export interface EvidenceSynthesis {
  supporting: string[];
  counter: string[];
  marketContext: string;
  confidenceScore: number;
}

async function safeFetchJson<T>(url: string, options: RequestInit, serviceName: string): Promise<T> {
  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '');
        if ((text.includes('warmup') || text.includes('<!doctype') || text.includes('<html')) && attempts < 2) {
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }
        throw new Error(`The ${serviceName} server is establishing connection. Please try again.`);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `${serviceName} failed with status ${res.status}`);
      }

      return (await res.json()) as T;
    } catch (err: any) {
      if (attempts >= 2) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`Unable to reach ${serviceName}. Please check your connection.`);
}

export async function fetchHealth(): Promise<any> {
  return safeFetchJson<any>('/api/health', { method: 'GET' }, 'Health Check');
}

export async function fetchDiagnostics(): Promise<DiagnosticsResponse> {
  return safeFetchJson<DiagnosticsResponse>('/api/diagnostics', { method: 'GET' }, 'Diagnostics');
}

export async function clarifyIdea(idea: string): Promise<{ questions: string; model: string }> {
  return safeFetchJson<{ questions: string; model: string }>(
    '/api/gemini/clarify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    },
    'Gemini Clarify'
  );
}

export async function challengeIdea(
  idea: string,
  clarifications?: string
): Promise<{ challenge: string; model: string }> {
  return safeFetchJson<{ challenge: string; model: string }>(
    '/api/gemini/challenge',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, clarifications }),
    },
    'Gemini Challenge'
  );
}

export async function evolveIdea(
  previousContent: string,
  newContent: string,
  conversationSummary?: string
): Promise<{ whatChanged: string; whyChanged: string; model: string }> {
  return safeFetchJson<{ whatChanged: string; whyChanged: string; model: string }>(
    '/api/gemini/evolve',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previousContent, newContent, conversationSummary }),
    },
    'Gemini Evolve'
  );
}

export async function askMyIdea(
  question: string,
  ideaTitle: string,
  currentContent: string,
  versions: any[]
): Promise<{ answer: string; model: string }> {
  return safeFetchJson<{ answer: string; model: string }>(
    '/api/gemini/ask',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, ideaTitle, currentContent, versions }),
    },
    'Gemini Ask'
  );
}

export async function searchEvidence(
  query: string,
  ideaContent?: string
): Promise<{
  query: string;
  sources: EvidenceSource[];
  synthesis: EvidenceSynthesis;
  model: string;
}> {
  return safeFetchJson<{
    query: string;
    sources: EvidenceSource[];
    synthesis: EvidenceSynthesis;
    model: string;
  }>(
    '/api/evidence/search',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ideaContent }),
    },
    'Tavily Evidence'
  );
}
