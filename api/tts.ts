export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return new Response('TTS not configured', { status: 500 });

  const body = await req.json() as { text?: string };
  const text = body.text?.trim();
  if (!text) return new Response('No text provided', { status: 400 });

  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-AU', name: 'en-AU-Standard-A' },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  if (!res.ok) return new Response('TTS error', { status: 502 });

  const data = await res.json() as { audioContent: string };
  const audio = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
  return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } });
}
