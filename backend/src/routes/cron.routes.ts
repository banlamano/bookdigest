import { Router, Request, Response } from 'express';
import { runStreakWarnings } from '../jobs/streak-warning.job';

const router = Router();

/**
 * Secret-protected cron endpoints. Intended for external schedulers
 * (Vercel Cron, Render Cron Job, cron-job.org, GitHub Actions, etc.)
 * as a backup or replacement for the in-process node-cron schedule.
 *
 * Auth: pass the ADMIN_SECRET either as ?secret=<value> or as
 * Authorization: Bearer <value>. Same secret as admin-simple routes
 * — keep rotation in sync.
 */
function checkCronSecret(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET || 'bookdigest-admin-2026';
  const provided =
    (req.query.secret as string | undefined) ||
    req.header('Authorization')?.replace(/^Bearer\s+/i, '') ||
    (req.body && req.body.secret);
  return provided === secret;
}

router.post('/streak-warnings', async (req: Request, res: Response) => {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  try {
    const result = await runStreakWarnings();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Allow GET too — some cron services only support GET requests.
router.get('/streak-warnings', async (req: Request, res: Response) => {
  if (!checkCronSecret(req)) {
    return res.status(403).json({ success: false, message: 'Invalid secret' });
  }
  try {
    const result = await runStreakWarnings();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
