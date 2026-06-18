// Shared Google Sheets helpers for all admin and submit endpoints.

import { google } from 'googleapis';

export const ONBOARDINGS_TAB = 'Onboardings';
export const ACCOUNTS_TAB = 'Accounts';

// ─── Admin columns appended after the 34 onboarding data columns ─────────────
export const ADMIN_COLS = [
  'Account ID',
  'Onboarding Name',
  'Status',       // pending | completed
  'PDF Link',
  'Created By',
  'Admin Created At',
];

export const ACCOUNTS_HEADERS = ['Account ID', 'Account Name', 'Created At'];

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function getAuth(extraScopes: string[] = []) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
  const credentials = JSON.parse(raw);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', ...extraScopes],
  });
}

export function getSheetsClient(auth: ReturnType<typeof getAuth>) {
  return google.sheets({ version: 'v4', auth });
}

// ─── Tab utilities ─────────────────────────────────────────────────────────────
export async function getSpreadsheetMeta(
  sheets: ReturnType<typeof getSheetsClient>,
  sheetId: string
) {
  const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  return res.data;
}

export function findTab(meta: Awaited<ReturnType<typeof getSpreadsheetMeta>>, tabName: string) {
  return meta.sheets?.find(s => s.properties?.title === tabName) ?? null;
}

// ─── Row lookup ────────────────────────────────────────────────────────────────
// Returns the 1-based sheet row number of the row matching sessionId, or -1.
export async function findRowBySessionId(
  sheets: ReturnType<typeof getSheetsClient>,
  sheetId: string,
  tabName: string,
  sessionId: string
): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!A:A`,
  });
  const rows = res.data.values ?? [];
  const idx = rows.findIndex((row, i) => i > 0 && row[0] === sessionId);
  return idx === -1 ? -1 : idx + 1; // convert 0-based array index to 1-based sheet row
}
