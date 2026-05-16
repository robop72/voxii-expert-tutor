export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('OpenAI key not configured', { status: 500 });

  const { extracted_text, subject, year_level, student_name } = await req.json();
  if (!extracted_text) return new Response('No content provided', { status: 400 });

  const excerpt = (extracted_text as string).slice(0, 8000);
  const name = student_name || 'there';

  const prompt = `You are creating an engaging educational podcast script for ${name}, a Year ${year_level} ${subject} student in Australia.

Transform the following content into a friendly, conversational study podcast (3-5 minutes when read aloud, roughly 500-750 words).

CONTENT TO TRANSFORM:
${excerpt}

Write the script as an enthusiastic study companion talking directly to the student. Include:
- A warm, engaging opening that previews what they'll learn
- Key concepts explained conversationally using analogies and real-world examples
- Natural transitions between topics
- A clear summary at the end with 2-3 key takeaways to remember

Write ONLY the spoken script — no stage directions, speaker labels, or formatting. Pure natural speech that flows well when read aloud.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) return new Response('OpenAI error', { status: 502 });

  const data = await res.json() as { choices: { message: { content: string } }[] };
  const script = data.choices[0].message.content?.trim() || '';
  return new Response(JSON.stringify({ script }), { headers: { 'Content-Type': 'application/json' } });
}
