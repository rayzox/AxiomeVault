const GROQ_KEY = process.env.GROQ_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { anonymizedText, messages, lang, userPrompt } = req.body;

  if (!anonymizedText || typeof anonymizedText !== "string") {
    return res.status(400).json({ error: "anonymizedText required" });
  }
  if (anonymizedText.length > 8000) {
    return res.status(400).json({ error: "Text too long (max 8000 chars)" });
  }
  if (!GROQ_KEY)
    return res.status(500).json({ error: "Server configuration error" });

  const outputLanguage =
    { en: "English", fr: "French", ar: "Arabic" }[lang] || "English";

  const docContext = `You are a professional document analyst. You have access to this anonymized document:

"""${anonymizedText}"""

CRITICAL RULES:
- Respond ONLY in ${outputLanguage}. Never mix languages.
- Use the document as context for all answers.
- If the user asks about specific content, reference what you see in the document.`;

  let groqMessages;

  if (messages && messages.length > 0) {
    // Follow-up chat mode
    groqMessages = [{ role: "system", content: docContext }, ...messages];
  } else {
    // Initial structured analysis
    const structuredPrompt = `${docContext}

Provide a structured analysis with these exact headers:

DOCUMENT TYPE
[type here]

KEY POINTS
- [point 1]
- [point 2]
- [point 3]

RISKS IDENTIFIED
- [risk 1]
- [risk 2]

RECOMMENDATIONS
- [rec 1]
- [rec 2]${userPrompt ? `\n\nADDITIONAL FOCUS: ${userPrompt}` : ""}`;

    groqMessages = [
      { role: "system", content: structuredPrompt },
      { role: "user", content: "Analyze this document." },
    ];
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1024,
        temperature: 0.3,
        messages: groqMessages,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res
        .status(502)
        .json({
          error: body?.error?.message || `Groq error: ${response.status}`,
        });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content)
      return res.status(502).json({ error: "Empty response from AI" });

    return res.status(200).json({ analysis: content });
  } catch (err) {
    console.error("AI proxy error:", err);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
