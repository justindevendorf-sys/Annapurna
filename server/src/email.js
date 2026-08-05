import nodemailer from 'nodemailer';
import { config } from './config.js';

async function sendViaSMTP({ host, port, user, pass }, { to, subject, html, text }) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });
  await transporter.sendMail({ from: user, to, subject, html, text });
}

async function sendViaResend({ apiKey, from }, { to, subject, html, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend responded ${res.status}: ${body}`);
  }
}

/**
 * Sends an email, trying providers in a fixed priority order (iCloud, then
 * Gmail, then Resend's free tier) and falling through to the next one on
 * failure. Only providers with credentials present in .env are attempted.
 */
export async function sendEmail({ to, subject, html, text }) {
  const attempts = [];

  if (config.icloud.email && config.icloud.appPassword) {
    attempts.push({
      name: 'iCloud',
      run: () =>
        sendViaSMTP(
          { host: 'smtp.mail.me.com', port: 587, user: config.icloud.email, pass: config.icloud.appPassword },
          { to, subject, html, text }
        ),
    });
  }

  if (config.gmail.email && config.gmail.appPassword) {
    attempts.push({
      name: 'Gmail',
      run: () =>
        sendViaSMTP(
          { host: 'smtp.gmail.com', port: 587, user: config.gmail.email, pass: config.gmail.appPassword },
          { to, subject, html, text }
        ),
    });
  }

  if (config.resend.apiKey) {
    attempts.push({
      name: 'Resend (free tier)',
      run: () => sendViaResend({ apiKey: config.resend.apiKey, from: config.resend.from }, { to, subject, html, text }),
    });
  }

  if (attempts.length === 0) {
    throw new Error(
      'No email provider is configured yet. Fill in ICLOUD_*, GMAIL_*, or RESEND_* in server/.env.'
    );
  }

  const errors = [];
  for (const attempt of attempts) {
    try {
      await attempt.run();
      console.log(`Weekly report sent via ${attempt.name}`);
      return { provider: attempt.name };
    } catch (err) {
      console.warn(`${attempt.name} send failed, trying next provider:`, err.message);
      errors.push(`${attempt.name}: ${err.message}`);
    }
  }

  throw new Error(`All email providers failed:\n${errors.join('\n')}`);
}
