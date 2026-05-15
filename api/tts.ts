export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('TTS not configured', { status: 500 });

  const body = await req.json() as { text?: string };
  const text = body.text?.trim();
  if (!text) return new Response('No text provided', { status: 400 });

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'tts-1', input: text, voice: 'nova' }),
  });

  if (!res.ok) return new Response('TTS error', { status: 502 });

  const audio = await res.arrayBuffer();
  return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } });
}
