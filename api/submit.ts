// Vercel Serverless Function — POST /api/submit
// Upserts one row in the Albie Onboarding Google Sheet.
// Matches by Session ID (column A): updates existing row or appends a new one.
//
// Required env vars:
//   GOOGLE_SHEET_ID             — ID from the sheet URL (between /d/ and /edit)
//   GOOGLE_SERVICE_ACCOUNT_JSON — full JSON key file content as a single string

import { google } from 'googleapis';
import { getAuth, getSheetsClient, ONBOARDINGS_TAB, findRowBySessionId, ensureHeaderColumn, updateCellByHeader } from './_sheets';
import type { SiteMinderData } from './_siteminder';
import { findOnboardingBySessionId, writeHotelFields, createHotelOnboardingFromPayload, isAirtableConfigured } from './_db';

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
    termsConditions?: string;
    dateFormat?: string;
    hasPms?: string;
    pmsName?: string;
    hasChannelManager?: string;
    channelManagerName?: string;
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
  // Stored separately from the 34-column data block — see the 'SiteMinder'
  // column write below. Not part of SHEET_HEADERS/rowFromPayload.
  siteMinder?: SiteMinderData;
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

// ─── Blank-overwrite guard ────────────────────────────────────────────────────
// A save is a WHOLE-ROW overwrite. If the client's state never hydrated (failed
// session load), the payload it builds is all defaults and empty scalars — and
// writing it destroys the customer's real answers. That is exactly how "Cowboy
// Village Resort" lost a completed onboarding.
//
// The client now refuses to build such a payload (see the `loadState` gate in
// src/App.tsx), but that only protects clients running the new bundle. A tab
// opened before that deploy still runs the old code, so the same check has to
// exist here, where nothing can bypass it.
//
// Deliberately narrow: it only refuses when the incoming payload has NO property
// name AND NO rooms, while the stored row HAS one of them. A partial edit, a
// genuinely new onboarding, and a still-empty onboarding all pass through
// untouched. Rejecting is recoverable (the user sees an error and can reload);
// blanking the row is not.
function isPayloadBlank(payload: SubmitPayload): boolean {
  const name = (payload.general?.propertyName ?? '').trim();
  const rooms = Array.isArray(payload.rooms) ? payload.rooms : [];
  return name === '' && rooms.length === 0;
}

function storedHasContent(propertyName: unknown, roomsJson: unknown): boolean {
  const name = String(propertyName ?? '').trim();
  if (name !== '') return true;
  const raw = String(roomsJson ?? '').trim();
  if (raw === '' || raw === '[]') return false;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    // Unparseable but non-empty: treat as content. Better to refuse a write we
    // can't reason about than to blank something that might be real.
    return true;
  }
}

const BLANK_OVERWRITE_ERROR =
  'Refused: this would erase existing answers. Your saved data could not be loaded — reload the page and try again.';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const payload: SubmitPayload = req.body;
  if (!payload?.propertyType) {
    return res.status(400).json({ error: 'Invalid payload: propertyType is required.' });
  }
  if (!payload?.sessionId) {
    return res.status(400).json({ error: 'Invalid payload: sessionId is required.' });
  }

  try {
    // ── Airtable first: if this onboarding already lives there, update it
    // there and never touch Sheets for this request. ───────────────────────
    const airtableHit = await findOnboardingBySessionId(payload.sessionId);
    if (airtableHit) {
      if (
        isPayloadBlank(payload) &&
        storedHasContent(airtableHit.record.fields['Property Name'], airtableHit.record.fields['Rooms'])
      ) {
        console.warn(`[submit] blocked blank overwrite of ${payload.sessionId} (Airtable)`);
        return res.status(409).json({ error: BLANK_OVERWRITE_ERROR });
      }
      await writeHotelFields(airtableHit.record.id, payload);
      return res.status(200).json({ success: true, action: 'updated' });
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      // No Sheets configured — a brand-new onboarding with no home yet goes
      // to Airtable (the "start fresh" default for anything not already in
      // the Sheet).
      if (isAirtableConfigured()) {
        await createHotelOnboardingFromPayload(payload);
        return res.status(200).json({ success: true, action: 'created' });
      }
      return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID environment variable.' });
    }

    const auth = getAuth();
    const sheets = getSheetsClient(auth);
    const rowData = rowFromPayload(payload);

    // ── Look for an existing row with this sessionId (column A) ────────────
    const sheetRowNumber = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, payload.sessionId);

    let resultRowNumber: number;
    let action: 'updated' | 'created';

    if (sheetRowNumber > 0) {
      // Same blank-overwrite guard as the Airtable branch above. Read the row
      // positionally (indices, not header names) because writes here are
      // positional too — the live header row has drifted from SHEET_HEADERS, so
      // resolving by name would look at the wrong columns.
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A${sheetRowNumber}:AZ${sheetRowNumber}`,
      });
      const existingRow = (existing.data.values?.[0] ?? []) as string[];
      const nameIdx = SHEET_HEADERS.indexOf('Property Name');
      const roomsIdx = SHEET_HEADERS.indexOf('Rooms');
      if (
        isPayloadBlank(payload) &&
        storedHasContent(existingRow[nameIdx], existingRow[roomsIdx])
      ) {
        console.warn(`[submit] blocked blank overwrite of ${payload.sessionId} (Sheets row ${sheetRowNumber})`);
        return res.status(409).json({ error: BLANK_OVERWRITE_ERROR });
      }

      // ── Update existing row (data cols only — admin cols stay untouched) ─
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      resultRowNumber = sheetRowNumber;
      action = 'updated';
    } else if (isAirtableConfigured()) {
      // ── Not found anywhere — new onboardings go to Airtable ─────────────
      await createHotelOnboardingFromPayload(payload);
      return res.status(200).json({ success: true, action: 'created' });
    } else {
      // ── Airtable not configured — original fallback: append to Sheets ───
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${ONBOARDINGS_TAB}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
      resultRowNumber = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, payload.sessionId);
      action = 'created';
    }

    // ── SiteMinder — written to a column APPENDED after the admin columns,
    // never inside the A:AH data block above (that would shift every column
    // after it and corrupt admin data like Account ID). Additive + isolated:
    // ensureHeaderColumn only ever adds a header cell if missing, and
    // updateCellByHeader targets exactly that one cell in this row.
    //
    // FAIL-OPEN: this is a secondary write. The core onboarding data was already
    // saved above. If anything here throws (e.g. the sheet grid needs widening),
    // we log and continue with success — a secondary write must NEVER block the
    // onboarding save or the final submit/PDF flow.
    if (resultRowNumber > 0) {
      try {
        await ensureHeaderColumn(sheets, sheetId, ONBOARDINGS_TAB, 'SiteMinder');
        await updateCellByHeader(
          sheets, sheetId, ONBOARDINGS_TAB, resultRowNumber, 'SiteMinder',
          JSON.stringify(payload.siteMinder ?? { connect: false, sites: [] }),
        );
      } catch (smErr: unknown) {
        const m = smErr instanceof Error ? smErr.message : 'Unknown error';
        console.warn('[submit] SiteMinder column write skipped (non-fatal):', m);
      }

      // Property Terms & Conditions and Date Format — same safe trailing-column
      // pattern as SiteMinder (they're "general" fields but can't live in the
      // A:AH block without shifting admin columns). Fail-open: never blocks the
      // save.
      try {
        await ensureHeaderColumn(sheets, sheetId, ONBOARDINGS_TAB, 'Property Terms & Conditions');
        await updateCellByHeader(
          sheets, sheetId, ONBOARDINGS_TAB, resultRowNumber, 'Property Terms & Conditions',
          payload.general?.termsConditions ?? '',
        );
      } catch (tcErr: unknown) {
        const m = tcErr instanceof Error ? tcErr.message : 'Unknown error';
        console.warn('[submit] Terms & Conditions column write skipped (non-fatal):', m);
      }

      try {
        await ensureHeaderColumn(sheets, sheetId, ONBOARDINGS_TAB, 'Date Format');
        await updateCellByHeader(
          sheets, sheetId, ONBOARDINGS_TAB, resultRowNumber, 'Date Format',
          payload.general?.dateFormat ?? '',
        );
      } catch (dfErr: unknown) {
        const m = dfErr instanceof Error ? dfErr.message : 'Unknown error';
        console.warn('[submit] Date Format column write skipped (non-fatal):', m);
      }

      // PMS / Channel Manager — same trailing-column pattern, but bundled as
      // ONE JSON column ('Property Systems') instead of 4 separate ones. This
      // block already makes 4 sequential column writes per save (SiteMinder,
      // Terms, Date Format, and now this); adding 4 more single-value columns
      // here would double that and slow down every autosave. Above the
      // persistence layer (session.ts) this still surfaces as 4 plain
      // general.* fields, matching the Airtable path exactly.
      try {
        await ensureHeaderColumn(sheets, sheetId, ONBOARDINGS_TAB, 'Property Systems');
        await updateCellByHeader(
          sheets, sheetId, ONBOARDINGS_TAB, resultRowNumber, 'Property Systems',
          JSON.stringify({
            hasPms: payload.general?.hasPms ?? '',
            pmsName: payload.general?.pmsName ?? '',
            hasChannelManager: payload.general?.hasChannelManager ?? '',
            channelManagerName: payload.general?.channelManagerName ?? '',
          }),
        );
      } catch (psErr: unknown) {
        const m = psErr instanceof Error ? psErr.message : 'Unknown error';
        console.warn('[submit] Property Systems column write skipped (non-fatal):', m);
      }
    }

    return res.status(200).json({ success: true, action, row: action === 'updated' ? resultRowNumber : undefined });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[submit]', message);
    return res.status(500).json({ error: message });
  }
}
