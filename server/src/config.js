import dotenv from 'dotenv';

dotenv.config();

function splitEmails(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  childName: process.env.CHILD_NAME?.trim() || 'your daughter',
  parentEmails: splitEmails(process.env.PARENT_EMAILS),
  reportCron: process.env.REPORT_CRON || '0 18 * * 0',
  reportTimezone: process.env.REPORT_TIMEZONE || 'America/New_York',
  icloud: {
    email: process.env.ICLOUD_EMAIL || '',
    appPassword: process.env.ICLOUD_APP_PASSWORD || '',
  },
  gmail: {
    email: process.env.GMAIL_EMAIL || '',
    appPassword: process.env.GMAIL_APP_PASSWORD || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'onboarding@resend.dev',
  },
};
