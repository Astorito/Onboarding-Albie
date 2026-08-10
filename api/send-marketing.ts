// Vercel Serverless Function — POST /api/send-marketing
// Renders the Digital Advertising onboarding summary PDF and emails it to
// admin (+ the POC, if set). Parallel to api/send-onboarding.ts, scoped to
// the marketing flow — no sandbox/production hotel-email branching, since
// this always notifies the internal team + POC, never the hotel guest.

import { Resend } from 'resend';
import * as React from 'react';
import { createMarketingPDF } from './_pdf/MarketingOnboardingPDF';
import { updateAirtableOnboardingFields } from './_db';
import { uploadToDrive } from './send-onboarding';

// nft-hint — see api/send-onboarding.ts's identical comment for why this is here.
if (false) require('@react-pdf/renderer');

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'submission';
}

function buildEmailBody(payload: any): string {
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
        The full Digital Advertising onboarding summary is attached as a PDF.
      </p>
    </div>
    <div style="padding:14px 28px;font-size:10px;color:#717878;text-align:center;background:#f0eded;">
      TAG DIGITAL MARKETING
    </div>
  </div>`;
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
    console.warn('[send-marketing] Missing RESEND_API_KEY or ADMIN_EMAIL — skipping email');
    return res.status(200).json({ success: false, skipped: true, reason: 'env not configured' });
  }

  const payload = req.body;
  if (!payload?.sessionId) {
    return res.status(400).json({ error: 'sessionId required' });
  }

  const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';
  const businessName = payload.basics?.businessName || 'New Business';

  try {
    // Same ESM-import trick as send-onboarding.ts — required because this
    // file compiles to CommonJS but @react-pdf/renderer is ESM-only.
    const importESM = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } =
      await importESM('@react-pdf/renderer');
    const MarketingPDF = createMarketingPDF({ Document, Page, Text, View, StyleSheet });
    const pdfBuffer = await renderToBuffer(React.createElement(MarketingPDF, { payload }) as any);
    const pdfFilename = `tag-marketing-onboarding-${slugify(businessName)}.pdf`;

    const driveUploadPromise = uploadToDrive(pdfBuffer, pdfFilename).catch((err: any) => {
      console.warn('[send-marketing] Drive upload failed (non-fatal):', err.message);
      return null;
    });

    const resend = new Resend(apiKey);
    const [sendResult, driveLink] = await Promise.all([
      resend.emails.send({
        from: `TAG Digital Marketing <${fromEmail}>`,
        to: adminEmail,
        subject: `New marketing onboarding: ${businessName}`,
        html: buildEmailBody(payload),
        attachments: [{ filename: pdfFilename, content: pdfBuffer }],
      }),
      driveUploadPromise,
    ]);

    if (sendResult.error) {
      console.error('[send-marketing] resend error:', sendResult.error);
      return res.status(502).json({ success: false, error: sendResult.error.message ?? 'Email send failed' });
    }

    // Save the Drive link + flip Status, then (fire-and-forget) notify the
    // POC with a clean copy — same pattern as send-onboarding.ts's savePdfLink.
    updateAirtableOnboardingFields(
      payload.sessionId,
      driveLink ? { 'PDF Link': driveLink, 'Status': 'completed' } : { 'Status': 'completed' },
    )
      .then(async (result) => {
        const pocEmail = result.pocEmail;
        if (!pocEmail || pocEmail === adminEmail) return;
        await resend.emails.send({
          from: `TAG Digital Marketing <${fromEmail}>`,
          to: pocEmail,
          subject: `New marketing onboarding: ${businessName}`,
          html: buildEmailBody(payload),
          attachments: [{ filename: pdfFilename, content: pdfBuffer }],
        });
        console.log(`[send-marketing] POC copy sent to ${pocEmail}`);
      })
      .catch((err: unknown) => {
        const m = err instanceof Error ? err.message : 'Unknown error';
        console.warn('[send-marketing] status update or POC email failed:', m);
      });

    console.log(`[send-marketing] sent to ${adminEmail}, id=${sendResult.data?.id}, drive=${driveLink ?? 'none'}`);
    return res.status(200).json({
      success: true,
      id: sendResult.data?.id ?? null,
      pdfLink: driveLink ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-marketing]', message);
    return res.status(500).json({ success: false, error: message });
  }
}
