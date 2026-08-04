// GET  /api/admin/onboardings — list all onboardings (requires auth)
// POST /api/admin/onboardings — create new onboarding row (requires auth)

import { requireAuth } from './_auth';
import {
  getAuth, getSheetsClient, ONBOARDINGS_TAB,
  readSheetAsObjects, buildRow, ADMIN_COLS,
  findRowBySessionId, getSpreadsheetMeta, findTab,
} from '../_sheets';
import {
  listAirtableOnboardings, createAirtableOnboarding,
  deleteAirtableOnboardingBySessionId, isAirtableConfigured,
} from '../_db';

// Fallback session id generator — only used if Airtable isn't configured
// (e.g. a preview/dev environment without the Airtable env vars set).
function generateSessionId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `albie_${Date.now()}_${rand}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = requireAuth(req, res);
  if (!payload) return;

  const sheetId = process.env.GOOGLE_SHEET_ID;

  // ── GET: return all onboardings — Airtable (new) + Sheets (legacy) merged ──
  if (req.method === 'GET') {
    const airtableRows = await listAirtableOnboardings();
    let sheetRows: Record<string, string>[] = [];
    if (sheetId) {
      const sheets = getSheetsClient(getAuth());
      const { rows } = await readSheetAsObjects(sheets, sheetId, ONBOARDINGS_TAB);
      sheetRows = rows;
    }
    return res.status(200).json([...airtableRows, ...sheetRows]);
  }

  // ── POST: create new onboarding — goes to Airtable (start-fresh default) ──
  if (req.method === 'POST') {
    const { accountId, onboardingName, pocEmail, type } = req.body ?? {};
    if (!accountId || !onboardingName) {
      return res.status(400).json({ error: 'accountId and onboardingName are required' });
    }

    if (isAirtableConfigured()) {
      const { sessionId } = await createAirtableOnboarding({
        accountId, onboardingName, pocEmail,
        createdBy: String(payload.email),
        type: type === 'marketing' ? 'marketing' : 'hotel',
      });
      return res.status(201).json({ sessionId });
    }

    // Airtable not configured — original fallback: create in Sheets.
    if (!sheetId) return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID' });
    const sheets = getSheetsClient(getAuth());
    const { headers } = await readSheetAsObjects(sheets, sheetId, ONBOARDINGS_TAB);
    const sessionId = generateSessionId();

    const row = buildRow(headers, {
      'Session ID':       sessionId,
      'Account ID':       accountId,
      'Onboarding Name':  onboardingName,
      'Status':           'pending',
      'Created By':       String(payload.email),
      'Admin Created At': new Date().toISOString(),
      'POC Email':        pocEmail ?? '',
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${ONBOARDINGS_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return res.status(201).json({ sessionId });
  }

  // ── DELETE: remove onboarding — Airtable first, then Sheets (legacy) ──────
  if (req.method === 'DELETE') {
    const sessionId = req.query?.sessionId as string;
    if (!sessionId) return res.status(400).json({ error: 'sessionId query param required' });

    const deletedFromAirtable = await deleteAirtableOnboardingBySessionId(sessionId);
    if (deletedFromAirtable) return res.status(200).json({ success: true });

    if (!sheetId) return res.status(404).json({ error: 'Onboarding not found' });
    const sheets = getSheetsClient(getAuth());

    const rowNum = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, sessionId);
    if (rowNum < 1) return res.status(404).json({ error: 'Onboarding not found' });

    // Get the numeric sheetId of the Onboardings tab (needed for batchUpdate)
    const meta = await getSpreadsheetMeta(sheets, sheetId);
    const tab = findTab(meta, ONBOARDINGS_TAB);
    const tabId = tab?.properties?.sheetId;
    if (tabId === undefined) return res.status(500).json({ error: 'Tab not found' });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: tabId,
              dimension: 'ROWS',
              startIndex: rowNum - 1, // 0-based
              endIndex: rowNum,
            },
          },
        }],
      },
    });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
