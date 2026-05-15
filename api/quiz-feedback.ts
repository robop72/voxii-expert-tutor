export const config = { runtime: 'edge' };

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: string;
  topic: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('OpenAI key not configured', { status: 500 });

  const { quiz, answers, subject, year_level, student_name } = await req.json();
  const name = student_name || 'the student';

  const questionsContext = (quiz.questions as Question[]).map(q => {
    const ans = (answers as Record<string, string>)[q.id] ?? 'Not answered';
    const correct = ans === q.correct;
    return `Question: ${q.question}\nOptions: ${q.options.join(' | ')}\nCorrect: ${q.correct}\nStudent answered: ${ans}\nResult: ${correct ? 'CORRECT' : 'INCORRECT'}`;
  }).join('\n\n');

  const score = (quiz.questions as Question[]).filter(q => (answers as Record<string, string>)[q.id] === q.correct).length;
  const total = (quiz.questions as Question[]).length;

  const prompt = `You are a warm, supportive Year ${year_level} ${subject} tutor reviewing ${name}'s quiz.
They scored ${score} out of ${total}.

Results:
${questionsContext}

Return ONLY valid JSON:
{
  "score": ${score},
  "max_score": ${total},
  "overall_message": "2-3 sentences: acknowledge their score warmly, highlight a strength, give one encouraging next step",
  "feedback": [
    {
      "id": "q1",
      "correct": true,
      "explanation": "1-2 sentences. Correct: reinforce the concept briefly. Incorrect: explain what the right answer is and WHY, constructively."
    }
  ]
}

Tone: encouraging, never harsh. For wrong answers explain the concept, don't just state the answer.`;

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
    const feedback = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(feedback), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response('Failed to parse feedback', { status: 500 });
  }
}
