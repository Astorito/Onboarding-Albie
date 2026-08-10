// Vercel Serverless Function — POST /api/marketing-submit
// Upserts one row in Airtable's Onboardings_Marketing table.
// Parallel to api/submit.ts, but scoped to the marketing flow: no Sheets
// fallback (marketing never lived there) and none of the hotel-specific
// trailing-column logic (SiteMinder / Terms / Date Format / Property Systems).

import {
  findOnboardingBySessionId, writeMarketingFields, createMarketingOnboardingFromPayload,
  MARKETING_TABLE, isAirtableConfigured,
} from './_db';

export interface MarketingSubmitPayload {
  sessionId: string;
  basics?: { email?: string; businessName?: string; pastCampaigns?: string };
  accounts?: {
    googleAdsAccount?: string; gtmAccount?: string; ga4Account?: string;
    facebookAccount?: string; driveFolderUrl?: string; youtubeUrl?: string;
  };
  strategy?: {
    goalBrandAwareness?: string; goalTraffic?: string; goalLeads?: string;
    goalPurchasesBookings?: string; goalOther?: string; competitors?: string;
    targetLocations?: string; approveAdCopy?: string; monthlyBudget?: string;
    ownCreditCard?: string; launchDate?: string; idealCustomerInsights?: string;
    additionalInfo?: string;
  };
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

  const payload: MarketingSubmitPayload = req.body;
  if (!payload?.sessionId) {
    return res.status(400).json({ error: 'Invalid payload: sessionId is required.' });
  }

  try {
    const hit = await findOnboardingBySessionId(payload.sessionId);
    if (hit && hit.table === MARKETING_TABLE) {
      await writeMarketingFields(hit.record.id, payload);
      return res.status(200).json({ success: true, action: 'updated' });
    }

    // Not found (or found in the hotel table under a colliding id, which
    // shouldn't happen given each session id is generated independently) —
    // create a new marketing row. Covers a brand-new anonymous visitor with
    // no admin-created row, same as the hotel flow's equivalent branch.
    await createMarketingOnboardingFromPayload(payload);
    return res.status(200).json({ success: true, action: 'created' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[marketing-submit]', message);
    return res.status(500).json({ error: message });
  }
}
