import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';

/**
 * Find users whose reading streak is at risk RIGHT NOW and email them.
 *
 * "At risk" = they have a streak of >= 2 days, their last read was YESTERDAY
 * (not today, not earlier), and today is about to end. Calendar-day diff is
 * computed against the server clock (UTC); BookDigest's audience is EU-heavy,
 * so running this around 18:00 UTC (= 19:00 CET / 20:00 CEST) catches users
 * in their evening before the midnight reset.
 *
 * Idempotent against the user-day pair: the cohort filter (lastReadDate in
 * [yesterday, today)) only matches once per user per day. A redeploy mid-cron
 * could re-fire, but that's rare and not catastrophic.
 *
 * Returns { sent, skipped } for HTTP callers / observability.
 */
export async function runStreakWarnings(): Promise<{ sent: number; skipped: number }> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Find users with active streaks who read yesterday but haven't read today.
  const atRisk = await prisma.user.findMany({
    where: {
      currentStreak: { gte: 2 },
      lastReadDate: {
        gte: startOfYesterday,
        lt: startOfToday,
      },
    },
    select: { id: true, email: true, firstName: true, currentStreak: true },
  });

  let sent = 0;
  let skipped = 0;
  for (const user of atRisk) {
    try {
      const result = await EmailService.sendStreakAtRisk(
        { email: user.email, firstName: user.firstName || 'there' },
        user.currentStreak
      );
      if (result.success) sent += 1;
      else skipped += 1;
    } catch (err) {
      logger.error(`Streak warning failed for ${user.email}:`, err);
      skipped += 1;
    }
  }

  logger.info(`Streak-warning job: ${sent} sent, ${skipped} skipped (cohort size: ${atRisk.length})`);
  return { sent, skipped };
}

/**
 * Schedule the in-process daily run at 18:00 UTC.
 * Safe to call multiple times — node-cron registers a new task each call;
 * callers should only invoke this once at server startup.
 */
export function startStreakWarningCron() {
  // 18:00 UTC every day. Cron expression: "minute hour * * *"
  cron.schedule('0 18 * * *', async () => {
    logger.info('⏰ Streak-warning cron fired');
    try {
      await runStreakWarnings();
    } catch (err) {
      logger.error('Streak-warning cron failed:', err);
    }
  });
  logger.info('✅ Streak-warning cron scheduled (daily @ 18:00 UTC)');
}
