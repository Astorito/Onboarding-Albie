// GET /api/session?token=<sessionId>
// Returns existing form data for a session (no auth — the token IS the access control).
// Used by the frontend to pre-load admin-filled data when the hotel opens their link.

import { getAuth, getSheetsClient, ONBOARDINGS_TAB, findRowBySessionId } from './_sheets';
import { SHEET_HEADERS } from './submit';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.query?.token as string;
  if (!token) return res.status(400).json({ error: 'token required' });

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID' });

  try {
    const auth = getAuth();
    const sheets = getSheetsClient(auth);

    const rowNum = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, token);
    if (rowNum < 1) return res.status(404).json({ error: 'Session not found' });

    // Read the data row and the real header row in parallel. The header row lets
    // us resolve admin-only columns (e.g. "Onboarding Name") by their actual
    // position, independent of the static SHEET_HEADERS data layout.
    const [rowRes, headerRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A${rowNum}:AZ${rowNum}`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A1:AZ1`,
      }),
    ]);
    const row = (rowRes.data.values?.[0] ?? []) as string[];
    const headers = (headerRes.data.values?.[0] ?? []) as string[];

    const col = (name: string): string => {
      const idx = SHEET_HEADERS.indexOf(name);
      return idx >= 0 ? (row[idx] ?? '') : '';
    };

    // Resolve a column by its real header position (works for admin columns too).
    const colByHeader = (name: string): string => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? (row[idx] ?? '') : '';
    };

    const tryJson = (val: string, fallback: any) => {
      if (!val) return fallback;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    return res.status(200).json({
      // Name the admin gave this onboarding at creation time (read-only).
      onboardingName: colByHeader('Onboarding Name') || null,
      propertyType: col('Property Type') || null,
      general: {
        propertyName:      col('Property Name'),
        description:       col('Description'),
        address:           col('Address'),
        city:              col('City'),
        stateProvince:     col('State / Province'),
        country:           col('Country'),
        zipCode:           col('ZIP / Postal Code'),
        timezone:          col('Timezone'),
        currency:          col('Currency'),
        language:          col('Language'),
        phone:             col('Phone'),
        notificationEmail: col('Notification Email'),
        websiteUrl:        col('Website URL'),
      },
      brand: {
        siteTitle:      col('Site Title'),
        primaryColor:   col('Primary Color'),
        secondaryColor: col('Secondary Color'),
        accentColor:    col('Accent Color'),
        fontFamily:     col('Font Family'),
        buttonStyle:    col('Button Style'),
        logoUrl:        col('Logo URL'),
        faviconUrl:     col('Favicon URL'),
      },
      dns: {
        subdomain: col('Subdomain'),
        gtmId:     col('GTM ID'),
        ga4Id:     col('GA4 Measurement ID'),
        mapId:     col('Google Map ID'),
      },
      cancellationPolicies: tryJson(col('Cancellation Policies'), []),
      rooms:        tryJson(col('Rooms'), []),
      addons:       tryJson(col('Add-ons'), {}),
      rates:        tryJson(col('Rates'), {}),
      taxes:        tryJson(col('Taxes'), []),
      groupMembers: tryJson(col('Group Members'), []),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[session]', message);
    return res.status(500).json({ error: message });
  }
}
