// ---------------------------------------------------------------------------
// tavilyService.js — Server-side Tavily Search API client for IdeaForge.
// ---------------------------------------------------------------------------
// NEVER exposed to the frontend. Implements basic search, timeout handling,
// response normalization, and free-tier quota optimization.
// ---------------------------------------------------------------------------

class TavilyError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'TavilyError';
    this.statusCode = statusCode;
  }
}

/**
 * Searches Tavily for real-world evidence.
 *
 * @param {object} params
 * @param {string} params.query        — Concise, sanitized search query
 * @param {string} [params.searchDepth='basic'] — 'basic' (free-tier optimized)
 * @param {number} [params.maxResults=5]        — Number of sources to retrieve (3-5)
 * @returns {Promise<Array<{ title: string, url: string, domain: string, snippet: string, relevanceScore: number|null }>>}
 */
async function searchTavily({ query, searchDepth = 'basic', maxResults = 5 }) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new TavilyError('Tavily API key is not configured on the server.', 503);
  }

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new TavilyError('A valid search query is required.', 400);
  }

  const sanitizedQuery = query.trim().slice(0, 350); // Keep well within limits

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: sanitizedQuery,
        search_depth: searchDepth,
        max_results: maxResults,
        include_answer: false,
        include_raw_content: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new TavilyError('Invalid or unauthorized Tavily API key.', 401);
      }
      if (response.status === 429) {
        throw new TavilyError('Tavily API rate limit reached. Please try again in a few moments.', 429);
      }
      const errBody = await response.text().catch(() => '');
      throw new TavilyError(`Tavily search failed (${response.status}): ${errBody || 'Unknown error'}`, response.status);
    }

    const data = await response.json();
    const rawResults = data?.results || [];

    // Normalize and clean results
    const sources = rawResults
      .filter((item) => item && item.url)
      .map((item) => {
        let domain = '';
        try {
          domain = new URL(item.url).hostname.replace(/^www\./, '');
        } catch (_e) {
          domain = 'web';
        }

        return {
          title: (item.title || 'Untitled Source').trim(),
          url: item.url.trim(),
          domain,
          snippet: (item.content || '').trim().slice(0, 400),
          relevanceScore: typeof item.score === 'number' ? Number(item.score.toFixed(3)) : null,
        };
      })
      .slice(0, 5);

    return sources;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new TavilyError('Evidence search timed out. Please try again.', 504);
    }
    if (err instanceof TavilyError) {
      throw err;
    }
    console.error('[TavilyService] Request error:', err.message);
    throw new TavilyError('Evidence search is temporarily unavailable.', 500);
  }
}

module.exports = {
  searchTavily,
  TavilyError,
};
