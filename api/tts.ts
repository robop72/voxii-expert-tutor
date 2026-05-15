export const config = { runtime: 'edge' };

const BACKEND = process.env.BACKEND_URL ?? 'https://voxii-tutor-backend-919882895306.australia-southeast1.run.app';
const FALLBACK_SECRET = process.env.API_SECRET ?? '';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const authHeader = req.headers.get('Authorization') ?? (FALLBACK_SECRET ? `Bearer ${FALLBACK_SECRET}` : '');
  const body = await req.text();
  const upstream = await fetch(`${BACKEND}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body,
  });
  const audio = await upstream.arrayBuffer();
  return new Response(audio, {
    status: upstream.status,
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
