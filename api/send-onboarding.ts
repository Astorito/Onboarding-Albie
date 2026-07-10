// Vercel Serverless Function — POST /api/send-onboarding
// Renders the onboarding summary PDF and emails it to admin (+ hotel in prod).
//
// Required env vars:
//   RESEND_API_KEY   — from resend.com signup
//   ADMIN_EMAIL      — where the email goes in sandbox mode (must match Resend
//                      account email until a domain is verified)
//   EMAIL_MODE       — 'sandbox' (default) or 'production'
//   FROM_EMAIL       — 'onboarding@resend.dev' (default) or your verified sender

import { Resend } from 'resend';
import * as React from 'react';
import { Readable } from 'stream';
import { google } from 'googleapis';
import { createOnboardingPDF } from './_pdf/OnboardingPDF';
import {
  getAuth, getSheetsClient, ONBOARDINGS_TAB,
  findRowBySessionId, updateCellByHeader,
} from './_sheets';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'submission';
}

function buildEmailBody(payload: any, isSandbox: boolean): string {
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

// ─── Drive upload ──────────────────────────────────────────────────────────────
async function uploadToDrive(pdfBuffer: Buffer, filename: string): Promise<string> {
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

// ─── Save PDF link to Sheets row, return POC email ────────────────────────────
async function savePdfLink(sessionId: string, pdfLink: string): Promise<string> {
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

  const mode = (process.env.EMAIL_MODE ?? 'sandbox').toLowerCase();
  const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';
  const hotelEmail = payload.general?.notificationEmail?.trim() || '';
  const hotelName = payload.general?.propertyName || 'New Property';
  const isProduction = mode === 'production' && hotelEmail !== '';

  try {
    // 1. Render PDF to buffer
    // `@react-pdf/renderer` is ESM-only; this file compiles to CommonJS.
    // A plain `await import(...)` looks like it should be fine (a real
    // dynamic import goes through Node's ESM loader regardless of the
    // caller's format) — but TypeScript, when targeting "module":"commonjs"
    // (required here so the other 8 handlers in /api load correctly under
    // Node's CJS loader), silently downlevels `await import(...)` into
    // `Promise.resolve().then(() => require(...))` — right back to the same
    // require() that throws ERR_REQUIRE_ESM. Building the call via
    // `new Function(...)` hides it from TypeScript's static downleveling:
    // the import() only exists inside a string, evaluated by V8 at runtime,
    // which always resolves it through the real ESM loader.
    const importESM = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } =
      await importESM('@react-pdf/renderer');
    const OnboardingPDF = createOnboardingPDF({ Document, Page, Text, View, StyleSheet });
    const pdfBuffer = await renderToBuffer(React.createElement(OnboardingPDF, { payload }) as any);
    const pdfFilename = `albie-onboarding-${slugify(hotelName)}.pdf`;

    // 2. Upload PDF to Google Drive (fire off in parallel with email)
    const driveUploadPromise = uploadToDrive(pdfBuffer, pdfFilename).catch(err => {
      console.warn('[send-onboarding] Drive upload failed (non-fatal):', err.message);
      return null;
    });

    // 3. Compose recipients & send email
    const to  = isProduction ? hotelEmail : adminEmail;
    const bcc = isProduction ? [adminEmail] : undefined;

    const resend = new Resend(apiKey);
    const [sendResult, driveLink] = await Promise.all([
      resend.emails.send({
        from: `Albie Onboarding <${fromEmail}>`,
        to,
        bcc,
        subject: `New onboarding: ${hotelName}`,
        html: buildEmailBody(payload, !isProduction),
        attachments: [{ filename: pdfFilename, content: pdfBuffer }],
      }),
      driveUploadPromise,
    ]);

    if (sendResult.error) {
      console.error('[send-onboarding] resend error:', sendResult.error);
      return res.status(502).json({ success: false, error: sendResult.error.message ?? 'Email send failed' });
    }

    // 4. Save Drive link in the Onboardings sheet and notify POC (fire-and-forget)
    if (driveLink && payload.sessionId && process.env.GOOGLE_SHEET_ID) {
      savePdfLink(payload.sessionId, driveLink)
        .then(async (pocEmail) => {
          if (!pocEmail || pocEmail === adminEmail) return;
          // Send a clean copy of the PDF to the POC
          await resend.emails.send({
            from: `Albie Onboarding <${fromEmail}>`,
            to: pocEmail,
            subject: `New onboarding: ${hotelName}`,
            html: buildEmailBody(payload, false),
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
