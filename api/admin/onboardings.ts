// GET  /api/admin/onboardings — list all onboardings (requires auth)
// POST /api/admin/onboardings — create new onboarding row (requires auth)

import { requireAuth } from './_auth';
import {
  getAuth, getSheetsClient, ONBOARDINGS_TAB,
  readSheetAsObjects, buildRow, ADMIN_COLS,
  findRowBySessionId, getSpreadsheetMeta, findTab,
} from '../_sheets';
import {
  listAirtableOnboardings, listAirtableEngagements, createAirtableOnboarding,
  deleteAirtableOnboardingBySessionId, isAirtableConfigured,
  createEngagement, type EngagementProducts,
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
  // Engagements (2+ products bundled behind one /e/<slug> hub link) are
  // listed as a single entry rather than one per product, so their hub link
  // stays discoverable/copyable after the creation modal has been closed —
  // otherwise the individual product rows below would each generate their
  // own single-product link and the hub link would be lost for good.
  if (req.method === 'GET') {
    const [airtableRows, engagementRows] = await Promise.all([
      listAirtableOnboardings(),
      listAirtableEngagements(),
    ]);

    const bundledSessionIds = new Set<string>();
    for (const eng of engagementRows) {
      for (const key of ['Hotel Session ID', 'Marketing Session ID', 'Web Design Session ID']) {
        if (eng[key]) bundledSessionIds.add(eng[key]);
      }
    }
    const unbundledAirtableRows = airtableRows.filter((r) => !bundledSessionIds.has(r['Session ID']));

    const engagementPseudoRows = engagementRows.map((f) => ({
      'Session ID': f['Engagement ID'],
      'Account ID': f['Account ID'] || '',
      'Onboarding Name': f['Onboarding Name'] || '',
      'Created By': f['Created By'] || '',
      'Admin Created At': f['Admin Created At'] || '',
      'POC Email': f['POC Email'] || '',
      'Type': 'engagement' as const,
      'Albie Enabled': !!f['Albie Enabled'],
      'Marketing Enabled': !!f['Marketing Enabled'],
      'Web Design Enabled': !!f['Web Design Enabled'],
    }));

    let sheetRows: Record<string, string>[] = [];
    if (sheetId) {
      const sheets = getSheetsClient(getAuth());
      const { rows } = await readSheetAsObjects(sheets, sheetId, ONBOARDINGS_TAB);
      sheetRows = rows;
    }
    return res.status(200).json([...engagementPseudoRows, ...unbundledAirtableRows, ...sheetRows]);
  }

  // ── POST: create new onboarding ──────────────────────────────────────────
  // `products` selects which of Albie / Web Design / Marketing / Social this
  // client bought. Defaults to Albie-only when omitted, preserving old
  // callers.
  // - Exactly 1 product selected -> identical to today's behavior: a single
  //   Onboardings_* row, link goes straight to that product's flow.
  // - 2+ selected (Albie/Web Design/Marketing only) -> an Engagement "hub"
  //   record bundling them behind one link.
  if (req.method === 'POST') {
    const { accountId, onboardingName, pocEmail } = req.body ?? {};
    const products: EngagementProducts & { social?: boolean } = req.body?.products ?? {
      albie: true, webDesign: false, marketing: false, social: false,
    };
    if (!accountId || !onboardingName) {
      return res.status(400).json({ error: 'accountId and onboardingName are required' });
    }

    const enabledCount = [products.albie, products.webDesign, products.marketing, products.social].filter(Boolean).length;
    if (enabledCount === 0) {
      return res.status(400).json({ error: 'Select at least one product' });
    }

    // Social doesn't participate in Engagement bundling yet — createEngagement
    // only knows about albie/webDesign/marketing, so letting this through
    // would silently create the bundle WITHOUT the social row: the request
    // would look successful while quietly dropping half of what was asked for.
    if (products.social && enabledCount > 1) {
      return res.status(400).json({ error: "Social Media can't be bundled with other products yet — create it as its own onboarding." });
    }

    // ── 2+ products: create an Engagement (requires Airtable) ──────────────
    if (enabledCount > 1) {
      if (!isAirtableConfigured()) {
        return res.status(500).json({ error: 'Airtable must be configured to create multi-product engagements' });
      }
      const { engagementId, slug } = await createEngagement({
        accountId, onboardingName, pocEmail,
        createdBy: String(payload.email),
        products,
      });
      return res.status(201).json({ isEngagement: true, engagementId, engagementSlug: slug });
    }

    // ── Exactly 1 product: unchanged single-onboarding path ────────────────
    const singleType: 'hotel' | 'marketing' | 'webdesign' | 'social' | null =
      products.albie ? 'hotel'
      : products.marketing ? 'marketing'
      : products.webDesign ? 'webdesign'
      : products.social ? 'social'
      : null;
    if (!singleType) {
      return res.status(400).json({ error: 'Select at least one product' });
    }

    if (isAirtableConfigured()) {
      const { sessionId } = await createAirtableOnboarding({
        accountId, onboardingName, pocEmail,
        createdBy: String(payload.email),
        type: singleType,
      });
      return res.status(201).json({ isEngagement: false, sessionId });
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

    return res.status(201).json({ isEngagement: false, sessionId });
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
