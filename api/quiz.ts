export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('OpenAI key not configured', { status: 500 });

  const { subject, year_level, student_profile, recent_summaries, question_count = 5 } = await req.json();

  const contextLines = recent_summaries?.length
    ? `\nRecent topics studied by this student:\n${(recent_summaries as string[]).join('\n')}`
    : '';

  const curriculum = student_profile?.state_curriculum
    ? ` following the ${student_profile.state_curriculum} curriculum`
    : '';

  const prompt = `You are an expert ${subject} teacher for Year ${year_level} students in Australia${curriculum}.
Generate exactly ${question_count} multiple-choice quiz questions.${contextLines}
${contextLines ? 'Base questions primarily on the recent topics listed above.' : `Cover core Year ${year_level} ${subject} topics.`}

Return ONLY a valid JSON object:
{
  "title": "Short quiz title (e.g. Year 9 Maths Quiz)",
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
- "correct" is the letter only (A/B/C/D)
- Mix difficulty: some straightforward, some requiring deeper thinking
- Questions must be unambiguous and curriculum-appropriate
- No trick questions`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
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
