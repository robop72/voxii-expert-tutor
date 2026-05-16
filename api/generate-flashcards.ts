export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('OpenAI key not configured', { status: 500 });

  const { extracted_text, subject, year_level, count = 10 } = await req.json();
  if (!extracted_text) return new Response('No content provided', { status: 400 });

  const excerpt = (extracted_text as string).slice(0, 8000);

  const prompt = `You are an expert ${subject} teacher creating flashcards for a Year ${year_level} student in Australia.

Based on the following content, create exactly ${count} high-quality flashcards.

CONTENT:
${excerpt}

Return ONLY a valid JSON object:
{
  "flashcards": [
    {
      "id": "f1",
      "question": "Clear, specific question",
      "answer": "Concise, accurate answer (1-3 sentences)",
      "topic": "short topic name"
    }
  ]
}

Rules:
- Exactly ${count} flashcards
- Questions should test understanding, not just recall
- Answers must be complete but concise
- Cover the most important concepts from the content
- No ambiguous or trick questions`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) return new Response('OpenAI error', { status: 502 });

  const data = await res.json() as { choices: { message: { content: string } }[] };
  try {
    const result = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response('Failed to parse flashcards', { status: 500 });
  }
}
