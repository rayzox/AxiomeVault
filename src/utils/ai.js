const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export const analyzeDocument = async (anonymizedText) => {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a professional document analyst. Analyze this document and respond with:

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
${anonymizedText}`
          }
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};