// Run once to set up Google Sheets tabs for the Albie admin panel.
// Usage: npx tsx --tsconfig api/tsconfig.json api/scripts/init-sheets.ts
//
// What it does:
//   1. Renames the first tab to "Onboardings" (if not already named that)
//   2. Ensures Onboardings has the full header row (data cols + admin cols)
//   3. Creates an "Accounts" tab if it doesn't exist
//   4. Sets Accounts headers

import 'dotenv/config';
import { google } from 'googleapis';
import {
  ONBOARDINGS_TAB,
  ACCOUNTS_TAB,
  ADMIN_COLS,
  ACCOUNTS_HEADERS,
  getAuth,
  getSheetsClient,
  getSpreadsheetMeta,
  findTab,
  colIndexToLetter,
} from '../sheets';
import { SHEET_HEADERS } from '../submit';

const FULL_ONBOARDINGS_HEADERS = [...SHEET_HEADERS, ...ADMIN_COLS];

async function main() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('Missing GOOGLE_SHEET_ID');

  const auth = getAuth();
  const sheets = getSheetsClient(auth);

  console.log('Fetching spreadsheet metadata…');
  let meta = await getSpreadsheetMeta(sheets, sheetId);
  console.log(`Found ${meta.sheets?.length} tab(s):`, meta.sheets?.map(s => s.properties?.title).join(', '));

  // ── Step 1: Ensure "Onboardings" tab exists ────────────────────────────────
  let onboardingsTab = findTab(meta, ONBOARDINGS_TAB);

  if (!onboardingsTab) {
    const firstTab = meta.sheets?.[0];
    const firstTabId = firstTab?.properties?.sheetId;
    const firstName = firstTab?.properties?.title;

    if (firstTabId !== undefined && firstName !== ONBOARDINGS_TAB) {
      console.log(`Renaming tab "${firstName}" → "${ONBOARDINGS_TAB}"…`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            updateSheetProperties: {
              properties: { sheetId: firstTabId, title: ONBOARDINGS_TAB },
              fields: 'title',
            },
          }],
        },
      });
      console.log('Renamed.');
    } else {
      // First tab doesn't exist at all — create it
      console.log(`Creating tab "${ONBOARDINGS_TAB}"…`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: ONBOARDINGS_TAB } } }] },
      });
      console.log('Created.');
    }
    // Re-fetch meta so findTab works below
    meta = await getSpreadsheetMeta(sheets, sheetId);
    onboardingsTab = findTab(meta, ONBOARDINGS_TAB);
  } else {
    console.log(`Tab "${ONBOARDINGS_TAB}" already exists — skipping rename.`);
  }

  // ── Step 2: Update Onboardings headers ────────────────────────────────────
  console.log('Reading current Onboardings headers…');
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${ONBOARDINGS_TAB}!1:1`,
  });
  const currentHeaders = (headerRes.data.values?.[0] ?? []) as string[];

  const missingAdminCols = ADMIN_COLS.filter(col => !currentHeaders.includes(col));

  if (currentHeaders.length === 0) {
    // Fresh tab — write full headers
    console.log('Writing full header row…');
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${ONBOARDINGS_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [FULL_ONBOARDINGS_HEADERS] },
    });
    console.log(`Wrote ${FULL_ONBOARDINGS_HEADERS.length} headers.`);
  } else if (missingAdminCols.length > 0) {
    // Existing headers — expand grid if needed, then append missing admin cols
    const targetCols = currentHeaders.length + missingAdminCols.length;
    const onboardingsSheetId = findTab(meta, ONBOARDINGS_TAB)?.properties?.sheetId;

    if (onboardingsSheetId !== undefined) {
      console.log(`Expanding grid to ${targetCols} columns…`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            appendDimension: {
              sheetId: onboardingsSheetId,
              dimension: 'COLUMNS',
              length: missingAdminCols.length,
            },
          }],
        },
      });
    }

    const startCol = currentHeaders.length + 1; // 1-based column index
    const colLetter = colIndexToLetter(startCol);
    console.log(`Appending ${missingAdminCols.length} admin columns starting at ${colLetter}…`);
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${ONBOARDINGS_TAB}!${colLetter}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [missingAdminCols] },
    });
    console.log('Admin columns added:', missingAdminCols.join(', '));
  } else {
    console.log('Onboardings headers are up to date — no changes needed.');
  }

  // ── Step 3: Ensure "Accounts" tab exists ──────────────────────────────────
  let accountsTab = findTab(meta, ACCOUNTS_TAB);

  if (!accountsTab) {
    console.log(`Creating tab "${ACCOUNTS_TAB}"…`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: ACCOUNTS_TAB } } }] },
    });
    console.log('Created.');
  } else {
    console.log(`Tab "${ACCOUNTS_TAB}" already exists — skipping.`);
  }

  // ── Step 4: Ensure Accounts headers ───────────────────────────────────────
  const accHeaderRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${ACCOUNTS_TAB}!1:1`,
  });
  const accHeaders = accHeaderRes.data.values?.[0] ?? [];

  if (accHeaders.length === 0) {
    console.log('Writing Accounts headers…');
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${ACCOUNTS_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [ACCOUNTS_HEADERS] },
    });
    console.log('Accounts headers set:', ACCOUNTS_HEADERS.join(', '));
  } else {
    console.log('Accounts headers already present — no changes needed.');
  }

  console.log('\n✓ Sheet initialization complete.');
}

main().catch(err => {
  console.error('Init failed:', err.message ?? err);
  process.exit(1);
});
