// Vercel Serverless Function — POST /api/submit
// Upserts one row in the Albie Onboarding Google Sheet.
// Matches by Session ID (column A): updates existing row or appends a new one.
//
// Required env vars:
//   GOOGLE_SHEET_ID             — ID from the sheet URL (between /d/ and /edit)
//   GOOGLE_SERVICE_ACCOUNT_JSON — full JSON key file content as a single string

import { google } from 'googleapis';
import { getAuth, getSheetsClient, ONBOARDINGS_TAB, findRowBySessionId } from './sheets';

// ─── Column headers (must match the sheet's first row exactly) ───────────────
export const SHEET_HEADERS = [
  // Identity
  'Session ID',
  'Timestamp',
  'Property Type',
  // General Information
  'Property Name',
  'Description',
  'Address',
  'City',
  'State / Province',
  'Country',
  'ZIP / Postal Code',
  'Timezone',
  'Currency',
  'Language',
  'Phone',
  'Notification Email',
  'Website URL',
  'Site Title',
  // Website & Brand
  'Primary Color',
  'Secondary Color',
  'Accent Color',
  'Font Family',
  'Button Style',
  'Logo URL',
  'Favicon URL',
  // DNS & Tracking
  'Subdomain',
  'GTM ID',
  'GA4 Measurement ID',
  'Google Map ID',
  // Cancellation Policies (JSON array)
  'Cancellation Policies',
  // Rooms (JSON array — includes per-room occupancy)
  'Rooms',
  // Add-ons (JSON object)
  'Add-ons',
  // Rates (JSON)
  'Rates',
  // Taxes (JSON array)
  'Taxes',
  // Group members (JSON array — only for Group type)
  'Group Members',
];

// ─── Payload type ─────────────────────────────────────────────────────────────
export interface SubmitPayload {
  sessionId: string;
  propertyType: 'independent' | 'group';
  general: {
    propertyName?: string;
    description?: string;
    address?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    zipCode?: string;
    timezone?: string;
    currency?: string;
    language?: string;
    phone?: string;
    notificationEmail?: string;
    websiteUrl?: string;
  };
  brand: {
    siteTitle?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    buttonStyle?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  dns: {
    subdomain?: string;
    gtmId?: string;
    ga4Id?: string;
    mapId?: string;
  };
  cancellationPolicies?: object[];
  rooms?: object[];
  addons?: Record<string, { enabled: boolean; price: string }>;
  rates?: object;
  taxes?: object[];
  groupMembers?: { id: number; name: string; url: string }[];
}

function rowFromPayload(payload: SubmitPayload): string[] {
  const { general, brand, dns } = payload;
  return [
    payload.sessionId,
    new Date().toISOString(),
    payload.propertyType ?? '',
    // General
    general?.propertyName ?? '',
    general?.description ?? '',
    general?.address ?? '',
    general?.city ?? '',
    general?.stateProvince ?? '',
    general?.country ?? '',
    general?.zipCode ?? '',
    general?.timezone ?? '',
    general?.currency ?? '',
    general?.language ?? '',
    general?.phone ?? '',
    general?.notificationEmail ?? '',
    general?.websiteUrl ?? '',
    brand?.siteTitle ?? '',
    // Brand
    brand?.primaryColor ?? '',
    brand?.secondaryColor ?? '',
    brand?.accentColor ?? '',
    brand?.fontFamily ?? '',
    brand?.buttonStyle ?? '',
    brand?.logoUrl ?? '',
    brand?.faviconUrl ?? '',
    // DNS
    dns?.subdomain ?? '',
    dns?.gtmId ?? '',
    dns?.ga4Id ?? '',
    dns?.mapId ?? '',
    // Complex fields as JSON strings (rooms now includes per-room occupancy)
    JSON.stringify(payload.cancellationPolicies ?? []),
    JSON.stringify(payload.rooms ?? []),
    JSON.stringify(payload.addons ?? {}),
    JSON.stringify(payload.rates ?? {}),
    JSON.stringify(payload.taxes ?? []),
    JSON.stringify(payload.groupMembers ?? []),
  ];
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID environment variable.' });
  }

  const payload: SubmitPayload = req.body;
  if (!payload?.propertyType) {
    return res.status(400).json({ error: 'Invalid payload: propertyType is required.' });
  }
  if (!payload?.sessionId) {
    return res.status(400).json({ error: 'Invalid payload: sessionId is required.' });
  }

  try {
    const auth = getAuth();
    const sheets = getSheetsClient(auth);
    const rowData = rowFromPayload(payload);

    // ── Look for an existing row with this sessionId (column A) ────────────
    const sheetRowNumber = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, payload.sessionId);

    if (sheetRowNumber > 0) {
      // ── Update existing row (data cols only — admin cols stay untouched) ─
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      return res.status(200).json({ success: true, action: 'updated', row: sheetRowNumber });
    } else {
      // ── Append new row ──────────────────────────────────────────────────
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      return res.status(200).json({ success: true, action: 'created' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[submit]', message);
    return res.status(500).json({ error: message });
  }
}
