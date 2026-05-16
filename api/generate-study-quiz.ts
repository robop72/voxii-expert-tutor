export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('OpenAI key not configured', { status: 500 });

  const { extracted_text, subject, year_level, question_count = 5 } = await req.json();
  if (!extracted_text) return new Response('No content provided', { status: 400 });

  const excerpt = (extracted_text as string).slice(0, 8000);

  const prompt = `You are an expert ${subject} teacher for Year ${year_level} students in Australia.

Generate exactly ${question_count} multiple-choice quiz questions based ONLY on the following content:

CONTENT:
${excerpt}

Return ONLY a valid JSON object:
{
  "title": "Quiz: [brief topic name from the content]",
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": "A",
      "topic": "short topic name"
    }
  ]
}

Rules:
- Exactly ${question_count} questions, exactly 4 options each labelled A, B, C, D
- Base all questions strictly on the provided content — do not use outside knowledge
- "correct" is the letter only (A/B/C/D)
- Mix difficulty: some straightforward, some requiring deeper understanding
- No ambiguous or trick questions`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) return new Response('OpenAI error', { status: 502 });

  const data = await res.json() as { choices: { message: { content: string } }[] };
  try {
    const quiz = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(quiz), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response('Failed to parse quiz', { status: 500 });
  }
}
