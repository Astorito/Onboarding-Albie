// GET  /api/admin/onboardings — list all onboardings (requires auth)
// POST /api/admin/onboardings — create new onboarding row (requires auth)

import { requireAuth } from './_auth';
import {
  getAuth, getSheetsClient, ONBOARDINGS_TAB,
  readSheetAsObjects, buildRow, ADMIN_COLS,
  findRowBySessionId, getSpreadsheetMeta, findTab,
} from '../_sheets';

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
  if (!sheetId) return res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID' });

  const auth = getAuth();
  const sheets = getSheetsClient(auth);

  // ── GET: return all onboardings ────────────────────────────────────────────
  if (req.method === 'GET') {
    const { rows } = await readSheetAsObjects(sheets, sheetId, ONBOARDINGS_TAB);
    return res.status(200).json(rows);
  }

  // ── POST: create new onboarding ────────────────────────────────────────────
  if (req.method === 'POST') {
    const { accountId, onboardingName } = req.body ?? {};
    if (!accountId || !onboardingName) {
      return res.status(400).json({ error: 'accountId and onboardingName are required' });
    }

    const { headers } = await readSheetAsObjects(sheets, sheetId, ONBOARDINGS_TAB);
    const sessionId = generateSessionId();

    const row = buildRow(headers, {
      'Session ID':       sessionId,
      'Account ID':       accountId,
      'Onboarding Name':  onboardingName,
      'Status':           'pending',
      'Created By':       String(payload.email),
      'Admin Created At': new Date().toISOString(),
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${ONBOARDINGS_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return res.status(201).json({ sessionId });
  }

  // ── DELETE: remove onboarding row by sessionId ────────────────────────────
  if (req.method === 'DELETE') {
    const sessionId = req.query?.sessionId as string;
    if (!sessionId) return res.status(400).json({ error: 'sessionId query param required' });

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
