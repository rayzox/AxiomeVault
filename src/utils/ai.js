// src/utils/ai.js

const API_BASE = import.meta.env.VITE_API_BASE || ''; // e.g., '' for same-origin, or 'https://yourdomain.com'

export const analyzeDocument = async (anonymizedText, lang = 'en', userPrompt = null) => {
  if (!anonymizedText) {
    const err = new Error('Empty document');
    err.code = 'EMPTY_DOCUMENT';
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonymizedText, lang, userPrompt }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const err = new Error(body.error || `Analysis failed: ${response.status}`);
      err.code = body.error?.includes('rate limit') ? 'AI_RATE_LIMIT' 
               : body.error?.includes('timed out') ? 'AI_TIMEOUT'
               : 'AI_ANALYSIS_FAILED';
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.analysis;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Analysis timed out after 35 seconds');
      timeoutErr.code = 'AI_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};