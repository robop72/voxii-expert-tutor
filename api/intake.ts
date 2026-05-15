export const config = { runtime: 'edge' };

const BACKEND = process.env.BACKEND_URL ?? 'https://voxii-tutor-backend-919882895306.australia-southeast1.run.app';
const FALLBACK_SECRET = process.env.API_SECRET ?? '';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const authHeader = req.headers.get('Authorization') ?? (FALLBACK_SECRET ? `Bearer ${FALLBACK_SECRET}` : '');
  const body = await req.text();
  const upstream = await fetch(`${BACKEND}/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body,
  });
  const data = await upstream.text();
  return new Response(data, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
