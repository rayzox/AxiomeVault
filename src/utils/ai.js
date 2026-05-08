const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export const analyzeDocument = async (anonymizedText, lang = 'en') => {
  if (!GROQ_KEY) {
    const error = new Error('Missing Groq API key. Check VITE_GROQ_KEY in .env');
    error.code = 'GROQ_KEY_MISSING';
    throw error;
  }

  const outputLanguage = {
    en: 'English',
    fr: 'French',
    ar: 'Arabic',
  }[lang] || 'English';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `You are a professional document analyst.

IMPORTANT:
Respond only in ${outputLanguage}.
Do not mix languages.
Keep the answer clear, structured, and professional.

Analyze this document and respond with:

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
- [rec 2]

Document to analyze:
${anonymizedText}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      let errorBody = {};

      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: 'Unable to parse Groq error response' };
      }

      const message =
        errorBody?.error?.message ||
        errorBody?.message ||
        'Groq API request failed';

      const error = new Error(`Groq API error: ${response.status} - ${message}`);
      error.status = response.status;

      if (response.status === 401) error.code = 'GROQ_INVALID_API_KEY';
      if (response.status === 429) error.code = 'GROQ_RATE_LIMIT';

      throw error;
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      const error = new Error('Groq response is empty or invalid');
      error.code = 'GROQ_EMPTY_RESPONSE';
      throw error;
    }

    return data.choices[0].message.content;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Groq API request timed out');
      timeoutError.code = 'GROQ_TIMEOUT';
      throw timeoutError;
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
};