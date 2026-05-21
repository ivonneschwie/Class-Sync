import type { NextApiRequest, NextApiResponse } from 'next';

// OpenRouter endpoint for free model routing
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate request body
  const { content, count = 10 } = req.body as { content?: string; count?: number };
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `content` field' });
  }

  const flashcardCount = Math.max(1, Math.min(40, count));

  // Ensure API key is configured
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key not configured' });
  }

  try {
    const prompt = `You are an expert academic tutor and flashcard creator. Your task is to generate exactly ${flashcardCount} highly effective flashcards based on the study material or lecture notes provided below.

Flashcard creation guidelines:
1. **Test Questions Priority**: If the material contains actual practice questions, multiple-choice items, or exam questions, you MUST prioritize them. Generate a dedicated flashcard for EVERY single practice/test question in the text up to the requested card count (${flashcardCount}). Do not skip or summarize these items.
2. **Back side MCQ details**: For a multiple-choice question on the front, the back should state the correct option clearly (e.g. "B) Photosynthesis") followed by a brief 1-2 sentence explanation of why it is the correct answer.
3. **Core Term/Concept extraction**: If there are no test questions (or to fill up the remaining count), extract key concepts, facts, formulas, or vocabulary terms.
4. Keep all texts clear, concise, and focused.

Study Material / Lecture Notes:
${content}

You MUST return the output as a strict JSON array of objects. Do not include any conversational filler, intro, outro, or markdown formatting (outside of the JSON block itself).
Each object in the array must have exactly two fields:
1. "front": the question or term (string).
2. "back": the answer or explanation (string).

Strict output format:
[
  {
    "front": "Term or Question 1",
    "back": "Definition or Answer 1"
  }
]`;

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a helpful study helper that generates flashcards from provided materials in raw JSON format.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'OpenRouter request failed', details: errText });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? '';

    let flashcards: any[] = [];
    try {
      // First attempt: direct parse
      flashcards = JSON.parse(text);
    } catch (e) {
      // Second attempt: extract JSON array block
      const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        try {
          flashcards = JSON.parse(arrayMatch[0]);
        } catch (innerErr: any) {
          return res.status(500).json({ error: 'Failed to parse AI output array structure', rawText: text, errorDetail: innerErr.message });
        }
      } else {
        return res.status(500).json({ error: 'Could not find a valid JSON array in AI response', rawText: text });
      }
    }

    // Double check structure
    if (!Array.isArray(flashcards)) {
      return res.status(500).json({ error: 'AI did not return a valid array', rawText: text });
    }

    const validatedFlashcards = flashcards.map((card: any) => ({
      front: String(card.front || card.question || '').trim(),
      back: String(card.back || card.answer || card.definition || '').trim()
    })).filter(card => card.front !== '' && card.back !== '');

    return res.status(200).json({ flashcards: validatedFlashcards });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
