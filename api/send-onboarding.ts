// Vercel Serverless Function — POST /api/send-onboarding
// Renders the onboarding summary PDF and emails it, for all three products —
// dispatches on `payload.product` ('hotel' | 'marketing' | 'website'),
// defaulting to 'hotel' so the existing hotel client (which never sends this
// field) keeps working unchanged. Unified from two separate functions
// (send-onboarding.ts + send-marketing.ts) purely to stay under Vercel's
// Hobby-plan 12-function ceiling when adding the website product — the hotel
// branch below is untouched logic, just moved inside an `if`.
//
// Required env vars:
//   RESEND_API_KEY   — from resend.com signup
//   ADMIN_EMAIL      — where the email goes in sandbox mode (must match Resend
//                      account email until a domain is verified)
//   EMAIL_MODE       — 'sandbox' (default) or 'production' (hotel product only)
//   FROM_EMAIL       — 'onboarding@resend.dev' (default) or your verified sender

import { Resend } from 'resend';
import * as React from 'react';
import { Readable } from 'stream';
import { google } from 'googleapis';
import { createOnboardingPDF } from './_pdf/OnboardingPDF';
import { createMarketingPDF } from './_pdf/MarketingOnboardingPDF';
import { createWebsitePDF } from './_pdf/WebsiteOnboardingPDF';
import {
  getAuth, getSheetsClient, ONBOARDINGS_TAB,
  findRowBySessionId, updateCellByHeader,
} from './_sheets';
import { updateAirtableOnboardingFields, isAirtableConfigured } from './_db';

// nft-hint: Vercel's Node File Tracer (nft) can't see inside new Function() strings.
// This dead-code require() is never executed (if(false)) but makes nft include
// @react-pdf/renderer and all its transitive dependencies in the Lambda bundle.
// The actual load happens at runtime via the new Function() dynamic import below.
if (false) require('@react-pdf/renderer');

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'submission';
}

function buildHotelEmailBody(payload: any, isSandbox: boolean): string {
  const g = payload.general ?? {};
  const hotelName = g.propertyName || 'New Property';
  const propertyType = payload.propertyType === 'group' ? 'Group' : 'Independent';
  const location = [g.city, g.country].filter(Boolean).join(', ');
  const sandboxNote = isSandbox
    ? `<p style="background:#fff8e1;border-left:3px solid #f59e0b;padding:10px 14px;margin:18px 0;font-size:12px;color:#78350f;">
         <strong>Sandbox mode:</strong> the hotel was not CC'd. Forward this email manually to
         ${g.notificationEmail ? `<a href="mailto:${g.notificationEmail}">${g.notificationEmail}</a>` : '(no contact email on file)'}
         or verify a domain in Resend to enable direct sending.
       </p>`
    : '';
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1b1b;">
    <div style="background:#12433F;color:#fff;padding:24px 28px;">
      <div style="font-size:11px;letter-spacing:2px;color:#dfec60;font-weight:bold;">NEW ONBOARDING</div>
      <div style="font-size:22px;font-weight:bold;margin-top:6px;">${hotelName}</div>
    </div>
    <div style="padding:24px 28px;background:#fcf9f8;">
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#717878;width:140px;">Property Type</td><td style="padding:6px 0;font-weight:bold;">${propertyType}</td></tr>
        ${location ? `<tr><td style="padding:6px 0;color:#717878;">Location</td><td style="padding:6px 0;">${location}</td></tr>` : ''}
        ${g.notificationEmail ? `<tr><td style="padding:6px 0;color:#717878;">Contact</td><td style="padding:6px 0;">${g.notificationEmail}</td></tr>` : ''}
        ${g.phone ? `<tr><td style="padding:6px 0;color:#717878;">Phone</td><td style="padding:6px 0;">${g.phone}</td></tr>` : ''}
        ${g.websiteUrl ? `<tr><td style="padding:6px 0;color:#717878;">Website</td><td style="padding:6px 0;">${g.websiteUrl}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#717878;">Session ID</td><td style="padding:6px 0;font-size:11px;color:#717878;">${payload.sessionId ?? ''}</td></tr>
      </table>
      <p style="margin-top:18px;font-size:13px;color:#1c1b1b;line-height:1.5;">
        The full configuration summary is attached as a PDF.
      </p>
      ${sandboxNote}
    </div>
    <div style="padding:14px 28px;font-size:10px;color:#717878;text-align:center;background:#f0eded;">
      ALBIE BY TAG · BOOKING ENGINE
    </div>
  </div>`;
}

function buildMarketingEmailBody(payload: any): string {
  const businessName = payload.basics?.businessName || 'New Business';
  const email = payload.basics?.email || '';
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1b1b;">
    <div style="background:#1d1e1f;color:#fff;padding:24px 28px;">
      <div style="font-size:11px;letter-spacing:2px;color:#e6007e;font-weight:bold;">NEW MARKETING ONBOARDING</div>
      <div style="font-size:22px;font-weight:bold;margin-top:6px;">${businessName}</div>
    </div>
    <div style="padding:24px 28px;background:#fcf9f8;">
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        ${email ? `<tr><td style="padding:6px 0;color:#717878;width:140px;">Contact</td><td style="padding:6px 0;font-weight:bold;">${email}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#717878;">Session ID</td><td style="padding:6px 0;font-size:11px;color:#717878;">${payload.sessionId ?? ''}</td></tr>
      </table>
      <p style="margin-top:18px;font-size:13px;color:#1c1b1b;line-height:1.5;">
        The full Paid Media onboarding summary is attached as a PDF.
      </p>
    </div>
    <div style="padding:14px 28px;font-size:10px;color:#717878;text-align:center;background:#f0eded;">
      TAG DIGITAL MARKETING
    </div>
  </div>`;
}

function buildWebsiteEmailBody(payload: any): string {
  const companyName = payload.company?.companyName || 'New Company';
  const email = payload.company?.email || '';
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1b1b;">
    <div style="background:#1d1e1f;color:#fff;padding:24px 28px;">
      <div style="font-size:11px;letter-spacing:2px;color:#e6007e;font-weight:bold;">NEW WEBSITE PROJECT ONBOARDING</div>
      <div style="font-size:22px;font-weight:bold;margin-top:6px;">${companyName}</div>
    </div>
    <div style="padding:24px 28px;background:#fcf9f8;">
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        ${email ? `<tr><td style="padding:6px 0;color:#717878;width:140px;">Contact</td><td style="padding:6px 0;font-weight:bold;">${email}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#717878;">Session ID</td><td style="padding:6px 0;font-size:11px;color:#717878;">${payload.sessionId ?? ''}</td></tr>
      </table>
      <p style="margin-top:18px;font-size:13px;color:#1c1b1b;line-height:1.5;">
        The full Website Project onboarding summary is attached as a PDF.
      </p>
    </div>
    <div style="padding:14px 28px;font-size:10px;color:#717878;text-align:center;background:#f0eded;">
      TAG DIGITAL MARKETING
    </div>
  </div>`;
}

// ─── Drive upload ──────────────────────────────────────────────────────────────
export async function uploadToDrive(pdfBuffer: Buffer, filename: string): Promise<string> {
  const auth = getAuth(['https://www.googleapis.com/auth/drive.file']);
  const drive = google.drive({ version: 'v3', auth });

  const uploadRes = await drive.files.create({
    requestBody: { name: filename, mimeType: 'application/pdf' },
    media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
    fields: 'id,webViewLink',
  });

  const fileId = uploadRes.data.id;
  if (!fileId) throw new Error('Drive upload returned no file ID');

  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return uploadRes.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`;
}

// ─── Save PDF link (Airtable first, then Sheets), return POC email ────────────
// Hotel-only: marketing/website never lived in Sheets, so their fallback would
// always be a no-op — they use updateAirtableOnboardingFields directly instead
// (see sendSimpleProductEmail below).
async function savePdfLink(sessionId: string, pdfLink: string): Promise<string> {
  // Airtable first — if the onboarding lives there, write back and stop.
  const airtableResult = await updateAirtableOnboardingFields(sessionId, {
    'PDF Link': pdfLink,
    'Status': 'completed',
  });
  if (airtableResult.ok) return airtableResult.pocEmail ?? '';

  // Fallback: existing onboardings still in the Sheet (unchanged).
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const auth = getAuth();
  const sheets = getSheetsClient(auth);

  const rowNum = await findRowBySessionId(sheets, sheetId, ONBOARDINGS_TAB, sessionId);
  if (rowNum < 1) {
    console.warn(`[send-onboarding] Session ${sessionId} not found in sheet — skipping PDF link save`);
    return '';
  }

  // Read the row to get POC Email before updating
  const [headerRes, rowRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${ONBOARDINGS_TAB}!1:1` }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${ONBOARDINGS_TAB}!${rowNum}:${rowNum}` }),
  ]);
  const headers = (headerRes.data.values?.[0] ?? []) as string[];
  const rowData = (rowRes.data.values?.[0] ?? []) as string[];
  const pocEmail = rowData[headers.indexOf('POC Email')] ?? '';

  await Promise.all([
    updateCellByHeader(sheets, sheetId, ONBOARDINGS_TAB, rowNum, 'PDF Link', pdfLink),
    updateCellByHeader(sheets, sheetId, ONBOARDINGS_TAB, rowNum, 'Status', 'completed'),
  ]);

  return pocEmail;
}

// ─── Shared send path for marketing & website — always admin (+ POC copy) ─────
// Marketing and website never distinguish sandbox/production or CC a guest —
// this is the logic that used to be duplicated verbatim inside send-marketing.ts.
async function sendSimpleProductEmail(opts: {
  resend: Resend;
  payload: any;
  adminEmail: string;
  fromEmail: string;
  fromName: string;
  subjectPrefix: string;
  filenamePrefix: string;
  displayName: string;
  buildBody: (payload: any) => string;
  pdfBuffer: Buffer;
  logTag: string;
}): Promise<{ id: string | null; pdfLink: string | null }> {
  const { resend, payload, adminEmail, fromEmail, fromName, subjectPrefix, filenamePrefix, displayName, buildBody, pdfBuffer, logTag } = opts;
  const pdfFilename = `${filenamePrefix}-${slugify(displayName)}.pdf`;

  const driveUploadPromise = uploadToDrive(pdfBuffer, pdfFilename).catch((err: any) => {
    console.warn(`[${logTag}] Drive upload failed (non-fatal):`, err.message);
    return null;
  });

  const [sendResult, driveLink] = await Promise.all([
    resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: `${subjectPrefix}: ${displayName}`,
      html: buildBody(payload),
      attachments: [{ filename: pdfFilename, content: pdfBuffer }],
    }),
    driveUploadPromise,
  ]);

  if (sendResult.error) {
    throw new Error(sendResult.error.message ?? 'Email send failed');
  }

  // Save the Drive link + flip Status, then (fire-and-forget) notify the POC
  // with a clean copy.
  updateAirtableOnboardingFields(
    payload.sessionId,
    driveLink ? { 'PDF Link': driveLink, 'Status': 'completed' } : { 'Status': 'completed' },
  )
    .then(async (result) => {
      const pocEmail = result.pocEmail;
      if (!pocEmail || pocEmail === adminEmail) return;
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: pocEmail,
        subject: `${subjectPrefix}: ${displayName}`,
        html: buildBody(payload),
        attachments: [{ filename: pdfFilename, content: pdfBuffer }],
      });
      console.log(`[${logTag}] POC copy sent to ${pocEmail}`);
    })
    .catch((err: unknown) => {
      const m = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`[${logTag}] status update or POC email failed:`, m);
    });

  console.log(`[${logTag}] sent to ${adminEmail}, id=${sendResult.data?.id}, drive=${driveLink ?? 'none'}`);
  return { id: sendResult.data?.id ?? null, pdfLink: driveLink ?? null };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    console.warn('[send-onboarding] Missing RESEND_API_KEY or ADMIN_EMAIL — skipping email');
    return res.status(200).json({ success: false, skipped: true, reason: 'env not configured' });
  }

  const payload = req.body;
  if (!payload?.sessionId) {
    return res.status(400).json({ error: 'sessionId required' });
  }

  // Defaults to 'hotel' so the existing hotel client — which never sends this
  // field — keeps behaving exactly as before.
  const product: 'hotel' | 'marketing' | 'website' = payload.product ?? 'hotel';
  const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';

  try {
    // `@react-pdf/renderer` is ESM-only; this file compiles to CommonJS.
    // A plain `await import(...)` looks like it should be fine (a real
    // dynamic import goes through Node's ESM loader regardless of the
    // caller's format) — but TypeScript, when targeting "module":"commonjs"
    // (required here so the other handlers in /api load correctly under
    // Node's CJS loader), silently downlevels `await import(...)` into
    // `Promise.resolve().then(() => require(...))` — right back to the same
    // require() that throws ERR_REQUIRE_ESM. Building the call via
    // `new Function(...)` hides it from TypeScript's static downleveling:
    // the import() only exists inside a string, evaluated by V8 at runtime,
    // which always resolves it through the real ESM loader.
    const importESM = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } =
      await importESM('@react-pdf/renderer');

    if (product === 'marketing') {
      const MarketingPDF = createMarketingPDF({ Document, Page, Text, View, StyleSheet });
      const pdfBuffer = await renderToBuffer(React.createElement(MarketingPDF, { payload }) as any);
      const resend = new Resend(apiKey);
      const result = await sendSimpleProductEmail({
        resend, payload, adminEmail, fromEmail,
        fromName: 'TAG Digital Marketing',
        subjectPrefix: 'New marketing onboarding',
        filenamePrefix: 'tag-marketing-onboarding',
        displayName: payload.basics?.businessName || 'New Business',
        buildBody: buildMarketingEmailBody,
        pdfBuffer,
        logTag: 'send-onboarding:marketing',
      });
      return res.status(200).json({ success: true, ...result });
    }

    if (product === 'website') {
      const WebsitePDF = createWebsitePDF({ Document, Page, Text, View, StyleSheet });
      const pdfBuffer = await renderToBuffer(React.createElement(WebsitePDF, { payload }) as any);
      const resend = new Resend(apiKey);
      const result = await sendSimpleProductEmail({
        resend, payload, adminEmail, fromEmail,
        fromName: 'TAG Digital Marketing',
        subjectPrefix: 'New website onboarding',
        filenamePrefix: 'tag-website-onboarding',
        displayName: payload.company?.companyName || 'New Company',
        buildBody: buildWebsiteEmailBody,
        pdfBuffer,
        logTag: 'send-onboarding:website',
      });
      return res.status(200).json({ success: true, ...result });
    }

    // ── Hotel (default) — unchanged from the original send-onboarding.ts ──────
    const mode = (process.env.EMAIL_MODE ?? 'sandbox').toLowerCase();
    const hotelEmail = payload.general?.notificationEmail?.trim() || '';
    const hotelName = payload.general?.propertyName || 'New Property';
    const isProduction = mode === 'production' && hotelEmail !== '';

    const OnboardingPDF = createOnboardingPDF({ Document, Page, Text, View, StyleSheet });
    const pdfBuffer = await renderToBuffer(React.createElement(OnboardingPDF, { payload }) as any);
    const pdfFilename = `albie-onboarding-${slugify(hotelName)}.pdf`;

    const driveUploadPromise = uploadToDrive(pdfBuffer, pdfFilename).catch(err => {
      console.warn('[send-onboarding] Drive upload failed (non-fatal):', err.message);
      return null;
    });

    const to  = isProduction ? hotelEmail : adminEmail;
    const bcc = isProduction ? [adminEmail] : undefined;

    const resend = new Resend(apiKey);
    const [sendResult, driveLink] = await Promise.all([
      resend.emails.send({
        from: `ALBIE Onboarding <${fromEmail}>`,
        to,
        bcc,
        subject: `New onboarding: ${hotelName}`,
        html: buildHotelEmailBody(payload, !isProduction),
        attachments: [{ filename: pdfFilename, content: pdfBuffer }],
      }),
      driveUploadPromise,
    ]);

    if (sendResult.error) {
      console.error('[send-onboarding] resend error:', sendResult.error);
      return res.status(502).json({ success: false, error: sendResult.error.message ?? 'Email send failed' });
    }

    if (driveLink && payload.sessionId && (isAirtableConfigured() || process.env.GOOGLE_SHEET_ID)) {
      savePdfLink(payload.sessionId, driveLink)
        .then(async (pocEmail) => {
          if (!pocEmail || pocEmail === adminEmail) return;
          await resend.emails.send({
            from: `ALBIE Onboarding <${fromEmail}>`,
            to: pocEmail,
            subject: `New onboarding: ${hotelName}`,
            html: buildHotelEmailBody(payload, false),
            attachments: [{ filename: pdfFilename, content: pdfBuffer }],
          });
          console.log(`[send-onboarding] POC copy sent to ${pocEmail}`);
        })
        .catch(err => console.warn('[send-onboarding] Sheet update or POC email failed:', err.message));
    }

    console.log(`[send-onboarding] sent (${mode}) to ${to}, id=${sendResult.data?.id}, drive=${driveLink ?? 'none'}`);
    return res.status(200).json({
      success: true,
      mode,
      to,
      bcc: bcc ?? null,
      id: sendResult.data?.id ?? null,
      pdfLink: driveLink ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-onboarding]', message);
    return res.status(500).json({ success: false, error: message });
  }
}
