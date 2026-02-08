import { Router } from 'express';

const router = Router();

// Email capture endpoint for marketing popup
router.post('/capture', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required',
      });
    }

    // TODO: Integrate with email marketing service (Mailchimp, SendGrid, etc.)
    // For now, just log and return success
    console.log('📧 Email captured:', email);

    // You can add database storage here if needed
    // await prisma.emailSubscriber.create({ data: { email } });

    res.json({
      success: true,
      message: 'Email successfully captured',
      data: { email },
    });
  } catch (error) {
    console.error('Email capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture email',
    });
  }
});

export default router;
