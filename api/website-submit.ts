// Vercel Serverless Function — POST /api/website-submit
// Upserts one row in Airtable's Onboardings_WebDesign table.
// Parallel to api/marketing-submit.ts: no Sheets fallback (web design never
// lived there) and none of the hotel-specific trailing-column logic.

import {
  findOnboardingBySessionId, writeWebsiteFields, createWebsiteOnboardingFromPayload,
  WEBDESIGN_TABLE, isAirtableConfigured,
} from './_db';

export interface WebsiteSubmitPayload {
  sessionId: string;
  company?: Record<string, string>;
  brand?: Record<string, string>;
  structure?: Record<string, string>;
  inspiration?: Record<string, string>;
  hotelGate?: Record<string, string>;
  hotelGeneral?: Record<string, string>;
  hotelTechnical?: Record<string, string>;
  features?: Record<string, string>;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAirtableConfigured()) {
    return res.status(500).json({ error: 'Airtable is not configured' });
  }

  const payload: WebsiteSubmitPayload = req.body;
  if (!payload?.sessionId) {
    return res.status(400).json({ error: 'Invalid payload: sessionId is required.' });
  }

  try {
    const hit = await findOnboardingBySessionId(payload.sessionId);
    if (hit && hit.table === WEBDESIGN_TABLE) {
      await writeWebsiteFields(hit.record.id, payload);
      return res.status(200).json({ success: true, action: 'updated' });
    }

    // Not found — create a new web design row. Covers a brand-new anonymous
    // visitor with no admin-created row, same as the marketing flow's
    // equivalent branch.
    await createWebsiteOnboardingFromPayload(payload);
    return res.status(200).json({ success: true, action: 'created' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[website-submit]', message);
    return res.status(500).json({ error: message });
  }
}
