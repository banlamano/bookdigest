import cron from 'node-cron';
import { generateSeoReport } from '../scripts/seo-report';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';

/**
 * Weekly SEO health report, emailed to the operator.
 *
 * Reuses generateSeoReport() (the same text the `npm run seo:weekly` CLI
 * prints) and emails it wrapped in a <pre> block so the column alignment
 * survives. Recipient is SEO_REPORT_EMAIL.
 *
 * On Render the service-account key must be provided inline via
 * GOOGLE_SA_KEY_JSON (the local ./secrets/sa.json file isn't deployed —
 * it's gitignored). Also needs SC_SITE_URL + GA4_PROPERTY_ID. If any of
 * those are missing the job no-ops with a logged warning rather than
 * throwing, so a half-configured server still boots cleanly.
 *
 * Returns { sent, reason? } for the HTTP endpoint / observability.
 */
export async function runWeeklySeoReport(days = 7): Promise<{ sent: boolean; reason?: string }> {
  const to = process.env.SEO_REPORT_EMAIL;
  if (!to) {
    logger.warn('SEO report cron: SEO_REPORT_EMAIL not set — skipping.');
    return { sent: false, reason: 'SEO_REPORT_EMAIL not set' };
  }

  const { ok, text } = await generateSeoReport(days);
  if (!ok) {
    // Credentials missing — `text` holds the setup help. Don't email noise;
    // just log so the operator can see why nothing arrived.
    logger.warn('SEO report cron: credentials not configured — skipping email.');
    return { sent: false, reason: 'Google credentials not configured' };
  }

  const date = new Date().toISOString().slice(0, 10);
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const html = `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap;">${escaped}</pre>`;

  const result = await EmailService.sendAdminNotification(
    to,
    `📊 BookDigest SEO report — ${date}`,
    html
  );

  if (result.success) {
    logger.info(`SEO report cron: emailed report to ${to} (id: ${result.id})`);
    return { sent: true };
  }
  logger.error(`SEO report cron: email failed — ${result.error}`);
  return { sent: false, reason: result.error };
}

/**
 * Schedule the in-process weekly run: Mondays at 08:00 UTC (= 09:00 CET /
 * 10:00 CEST) — a Monday-morning inbox summary of the prior week.
 * Cron expression: "minute hour * * day-of-week" (1 = Monday).
 */
export function startSeoReportCron() {
  cron.schedule('0 8 * * 1', async () => {
    logger.info('⏰ Weekly SEO report cron fired');
    try {
      await runWeeklySeoReport();
    } catch (err) {
      logger.error('SEO report cron failed:', err);
    }
  });
  logger.info('✅ Weekly SEO report cron scheduled (Mondays @ 08:00 UTC)');
}
