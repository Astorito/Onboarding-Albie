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
import { renderToBuffer } from '@react-pdf/renderer';
import * as React from 'react';
import { OnboardingPDF } from './pdf/OnboardingPDF';

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
    const pdfBuffer = await renderToBuffer(React.createElement(OnboardingPDF, { payload }) as any);

    // 2. Compose recipients
    const to  = isProduction ? hotelEmail : adminEmail;
    const bcc = isProduction ? [adminEmail] : undefined;

    // 3. Send
    const resend = new Resend(apiKey);
    const sendResult = await resend.emails.send({
      from: `Albie Onboarding <${fromEmail}>`,
      to,
      bcc,
      subject: `New onboarding: ${hotelName}`,
      html: buildEmailBody(payload, !isProduction),
      attachments: [
        {
          filename: `albie-onboarding-${slugify(hotelName)}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (sendResult.error) {
      console.error('[send-onboarding] resend error:', sendResult.error);
      return res.status(502).json({ success: false, error: sendResult.error.message ?? 'Email send failed' });
    }

    console.log(`[send-onboarding] sent (${mode}) to ${to}, id=${sendResult.data?.id}`);
    return res.status(200).json({
      success: true,
      mode,
      to,
      bcc: bcc ?? null,
      id: sendResult.data?.id ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[send-onboarding]', message);
    return res.status(500).json({ success: false, error: message });
  }
}
