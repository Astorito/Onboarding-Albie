// Vercel Serverless Function — POST /api/submit
// Appends one row to the Albie Onboarding Google Sheet.
//
// Required env vars:
//   GOOGLE_SHEET_ID             — ID from the sheet URL (between /d/ and /edit)
//   GOOGLE_SERVICE_ACCOUNT_JSON — full JSON key file content as a single string

import { google } from 'googleapis';

// ─── Column headers (must match the sheet's first row exactly) ───────────────
export const SHEET_HEADERS = [
  // Meta
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
  // DNS & Tracking
  'Subdomain',
  'GTM ID',
  'GA4 Measurement ID',
  'Google Map ID',
  // Cancellation Policies (JSON array)
  'Cancellation Policies',
  // Rooms (JSON array)
  'Rooms',
  // Room Occupancy
  'Min Adults',
  'Max Adults',
  'Max Occupants',
  'Children Capacity',
  'Included Occupancy',
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
  };
  dns: {
    subdomain?: string;
    gtmId?: string;
    ga4Id?: string;
    mapId?: string;
  };
  cancellationPolicies?: object[];
  rooms?: object[];
  occupancy?: {
    minAdults?: string;
    maxAdults?: string;
    maxOccupants?: string;
    childrenCapacity?: string;
    includedOccupancy?: string;
  };
  addons?: Record<string, { enabled: boolean; price: string }>;
  rates?: object;
  taxes?: object[];
  groupMembers?: { id: number; name: string; url: string }[];
}

function rowFromPayload(payload: SubmitPayload): string[] {
  const { general, brand, dns, occupancy } = payload;
  return [
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
    // DNS
    dns?.subdomain ?? '',
    dns?.gtmId ?? '',
    dns?.ga4Id ?? '',
    dns?.mapId ?? '',
    // Complex fields as JSON strings
    JSON.stringify(payload.cancellationPolicies ?? []),
    JSON.stringify(payload.rooms ?? []),
    occupancy?.minAdults ?? '',
    occupancy?.maxAdults ?? '',
    occupancy?.maxOccupants ?? '',
    occupancy?.childrenCapacity ?? '',
    occupancy?.includedOccupancy ?? '',
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
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId || !serviceAccountJson) {
    return res.status(500).json({
      error: 'Missing GOOGLE_SHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON environment variables.',
    });
  }

  const payload: SubmitPayload = req.body;
  if (!payload?.propertyType) {
    return res.status(400).json({ error: 'Invalid payload: propertyType is required.' });
  }

  try {
    // Parse credentials — Vercel stores multi-line private_key with literal \n
    const credentials = JSON.parse(serviceAccountJson);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Append one row to the first sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowFromPayload(payload)],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[submit]', message);
    return res.status(500).json({ error: message });
  }
}
