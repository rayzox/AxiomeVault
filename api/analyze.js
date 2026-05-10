// pages/api/analyze.js  (or app/api/analyze/route.js for App Router)

const GROQ_KEY = process.env.GROQ_KEY; // NOT VITE_ prefix — server-side only
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { anonymizedText, lang, userPrompt } = req.body;

  // Validation
  if (!anonymizedText || typeof anonymizedText !== 'string') {
    return res.status(400).json({ error: 'anonymizedText required' });
  }
  if (anonymizedText.length > 8000) {
    return res.status(400).json({ error: 'Text too long (max 8000 chars)' });
  }

  if (!GROQ_KEY) {
    console.error('Missing GROQ_KEY env var');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const outputLanguage = { en: 'English', fr: 'French', ar: 'Arabic' }[lang] || 'English';
  const safeUserPrompt = userPrompt 
    ? userPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 500)
    : null;

  const systemContent = `You are a professional document analyst.
Respond ONLY in ${outputLanguage}. Do not mix languages.
Keep the answer clear, structured, and professional.

${safeUserPrompt
  ? `The user has a specific request — answer it thoroughly using the document below:\n"${safeUserPrompt}"`
  : `Analyze this document and respond with:

📋 DOCUMENT TYPE:
[type here]

🔍 KEY POINTS:
- [point 1]
- [point 2]
- [point 3]

⚠️ RISKS IDENTIFIED:
- [risk 1]
- [risk 2]

💡 RECOMMENDATIONS:
- [rec 1]
- [rec 2]`}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: anonymizedText },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.error?.message || `Groq error: ${response.status}`;
      
      // Forward specific status codes
      if (response.status === 401) {
        return res.status(502).json({ error: 'Invalid AI provider credentials' });
      }
      if (response.status === 429) {
        return res.status(503).json({ error: 'AI rate limit exceeded. Try again in a moment.' });
      }
      
      return res.status(502).json({ error: message });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'Empty response from AI provider' });
    }

    return res.status(200).json({ analysis: content });
  } catch (err) {
    console.error('AI proxy error:', err);
    return res.status(500).json({ 
      error: err.name === 'AbortError' ? 'Request timed out' : 'AI analysis failed' 
    });
  }
}