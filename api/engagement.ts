// GET /api/engagement?token=<engagementId> | ?slug=<slug>
// Resolves an Engagement (a link bundling 2+ products behind a hub screen) and
// returns which products are enabled, plus a ready-to-use slug for Albie's own
// onboarding flow if it's one of them. No auth — the token/slug IS the access
// control, same model as /api/session.

import {
  findEngagementBySessionId, findEngagementBySlug, engagementResponseFromRecord,
} from './_db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.query?.token as string | undefined;
  const slug = req.query?.slug as string | undefined;
  if (!token && !slug) return res.status(400).json({ error: 'token or slug required' });

  try {
    const record = slug
      ? await findEngagementBySlug(slug)
      : await findEngagementBySessionId(token ?? '');
    if (!record) return res.status(404).json({ error: 'Engagement not found' });

    return res.status(200).json(engagementResponseFromRecord(record));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[engagement]', message);
    return res.status(500).json({ error: message });
  }
}
