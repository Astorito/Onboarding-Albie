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
  'POC Email',
  'SiteMinder',   // JSON blob {connect, sites:[]} — written/read by header name only
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

// ─── Read entire tab as objects ────────────────────────────────────────────────
export async function readSheetAsObjects(
  sheets: ReturnType<typeof getSheetsClient>,
  sheetId: string,
  tabName: string
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!A:AZ`,
  });
  const [headerRow, ...dataRows] = res.data.values ?? [];
  const headers = (headerRow ?? []) as string[];
  const rows = (dataRows ?? []).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, (row[i] ?? '') as string]))
  );
  return { headers, rows };
}

// ─── Build a sparse row from an object, aligned to a header array ─────────────
export function buildRow(headers: string[], values: Record<string, string>): string[] {
  return headers.map(h => values[h] ?? '');
}

// ─── Column letter conversion (1-based index → "A", "AA", etc.) ───────────────
export function colIndexToLetter(index: number): string {
  let letter = '';
  while (index > 0) {
    const rem = (index - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    index = Math.floor((index - 1) / 26);
  }
  return letter;
}

// ─── Update a single cell identified by column header name ────────────────────
export async function updateCellByHeader(
  sheets: ReturnType<typeof getSheetsClient>,
  sheetId: string,
  tabName: string,
  rowNum: number,  // 1-based sheet row number
  colName: string,
  value: string
): Promise<void> {
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!1:1`,
  });
  const headers = (headerRes.data.values?.[0] ?? []) as string[];
  const colIdx = headers.indexOf(colName);
  if (colIdx === -1) throw new Error(`Column "${colName}" not found in ${tabName}`);
  const colLetter = colIndexToLetter(colIdx + 1);
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabName}!${colLetter}${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[value]] },
  });
}

// ─── Add a header column if it doesn't exist yet ──────────────────────────────
// Additive only: appends colName to the first empty cell after the last header
// in row 1. Never touches existing header cells or any data row. Safe to call
// on every write — it's a no-op once the column exists.
export async function ensureHeaderColumn(
  sheets: ReturnType<typeof getSheetsClient>,
  sheetId: string,
  tabName: string,
  colName: string
): Promise<void> {
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!1:1`,
  });
  const headers = (headerRes.data.values?.[0] ?? []) as string[];
  if (headers.includes(colName)) return;
  const colLetter = colIndexToLetter(headers.length + 1);
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabName}!${colLetter}1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[colName]] },
  });
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
