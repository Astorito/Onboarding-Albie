// Vercel Serverless Function — POST /api/marketing-submit
// Upserts one row in Airtable's Onboardings_Marketing table — OR, when the
// payload carries `product`, one row in that product's table instead
// ('social' → Onboardings_Social, 'activities' → Onboardings_Activities).
//
// Social and OnActivities piggyback on this endpoint rather than getting their
// own api/*-submit.ts because Vercel's Hobby plan caps a project at 12
// Serverless Functions and this project is at 11 — a dedicated file would use
// the very last slot. Marketing itself is unaffected: its payloads never set
// `product`, so every branch below defaults to the marketing behavior exactly
// as it worked before.
//
// Parallel to api/submit.ts, but scoped to these two flows: no Sheets
// fallback (neither ever lived there) and none of the hotel-specific
// trailing-column logic (SiteMinder / Terms / Date Format / Property Systems).

import {
  findOnboardingBySessionId, writeMarketingFields, createMarketingOnboardingFromPayload,
  writeSocialFields, createSocialOnboardingFromPayload,
  isSocialPayloadBlank, socialRecordHasContent,
  writeActivitiesFields, createActivitiesOnboardingFromPayload,
  isActivitiesPayloadBlank, activitiesRecordHasContent,
  MARKETING_TABLE, SOCIAL_TABLE, ACTIVITIES_TABLE, isAirtableConfigured,
} from './_db';

export interface MarketingSubmitPayload {
  sessionId: string;
  product?: 'marketing' | 'social' | 'activities';
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
  // Social's shape — see api/_db.ts's SOCIAL_MODULES for the field lists.
  company?: Record<string, string>;
  goals?: Record<string, string>;
  offerings?: Record<string, string>;
  brand?: Record<string, string>;
  assets?: Record<string, string>;
  competitors?: Record<string, string>;
  // OnActivities' shape — `brand` above is shared with Social (same key, both
  // are flat string maps). See src/activities/types.ts for the item shapes.
  general?: Record<string, string>;
  activities?: unknown[];
  cancellationPolicies?: unknown[];
  taxes?: unknown[];
}

const BLANK_OVERWRITE_ERROR =
  'Refused: this would erase existing answers. Your saved data could not be loaded — reload the page and try again.';

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

  const isSocial = payload.product === 'social';
  const isActivities = payload.product === 'activities';
  const targetTable = isSocial ? SOCIAL_TABLE : isActivities ? ACTIVITIES_TABLE : MARKETING_TABLE;

  try {
    const hit = await findOnboardingBySessionId(payload.sessionId);
    if (hit && hit.table === targetTable) {
      if (isSocial) {
        if (isSocialPayloadBlank(payload) && socialRecordHasContent(hit.record.fields)) {
          console.warn(`[marketing-submit] blocked blank overwrite of ${payload.sessionId} (Social)`);
          return res.status(409).json({ error: BLANK_OVERWRITE_ERROR });
        }
        await writeSocialFields(hit.record.id, payload);
      } else if (isActivities) {
        if (isActivitiesPayloadBlank(payload) && activitiesRecordHasContent(hit.record.fields)) {
          console.warn(`[marketing-submit] blocked blank overwrite of ${payload.sessionId} (OnActivities)`);
          return res.status(409).json({ error: BLANK_OVERWRITE_ERROR });
        }
        await writeActivitiesFields(hit.record.id, payload);
      } else {
        await writeMarketingFields(hit.record.id, payload);
      }
      return res.status(200).json({ success: true, action: 'updated' });
    }

    // Not found (or found in a different product's table under a colliding
    // id, which shouldn't happen given each session id is generated
    // independently) — create a new row. Covers a brand-new anonymous
    // visitor with no admin-created row, same as the hotel flow's equivalent
    // branch.
    if (isSocial) {
      await createSocialOnboardingFromPayload(payload);
    } else if (isActivities) {
      await createActivitiesOnboardingFromPayload(payload);
    } else {
      await createMarketingOnboardingFromPayload(payload);
    }
    return res.status(200).json({ success: true, action: 'created' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[marketing-submit]', message);
    return res.status(500).json({ error: message });
  }
}
