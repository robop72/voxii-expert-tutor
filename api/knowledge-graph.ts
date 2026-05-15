export const config = { runtime: 'edge' };

const BACKEND = process.env.BACKEND_URL ?? 'https://voxii-tutor-backend-919882895306.australia-southeast1.run.app';
const FALLBACK_SECRET = process.env.API_SECRET ?? '';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  const url = new URL(req.url);
  const profileId = url.searchParams.get('profile_id') ?? '';
  const authHeader = req.headers.get('Authorization') ?? (FALLBACK_SECRET ? `Bearer ${FALLBACK_SECRET}` : '');

  const upstream = await fetch(
    `${BACKEND}/knowledge-graph?profile_id=${encodeURIComponent(profileId)}`,
    {
      method: 'GET',
      headers: { Authorization: authHeader },
    },
  );
  const data = await upstream.text();
  return new Response(data, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
