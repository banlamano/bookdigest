import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
// Accept either FROM_EMAIL (what the code originally read) or EMAIL_FROM
// (what was actually set in .env). Either spelling works.
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'BookDigest <onboarding@resend.dev>';
const SITE_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://book-digest.com';

// Helper to check if email service is enabled
function isEmailEnabled(): boolean {
  return !!resend;
}

/**
 * Supported languages for transactional emails. New languages: add a
 * literal here and a corresponding branch in each template object.
 */
export type Lang = 'en' | 'de';

/**
 * Pick the language variant of a template. Falls back to English when
 * the requested language isn't recognised — never throw on bad input,
 * since `language` may come from user data set years ago under a
 * different schema.
 */
function pick<T>(language: string | undefined, variants: { en: T; de: T }): T {
  return language === 'de' ? variants.de : variants.en;
}

export class EmailService {
  /**
   * Surface the current config so we can debug "emails aren't arriving"
   * without exposing secret values.
   */
  static getConfigStatus() {
    return {
      resendKeyConfigured: !!RESEND_API_KEY,
      fromEmail: FROM_EMAIL,
      siteUrl: SITE_URL,
      usingDefaultSender: FROM_EMAIL.includes('onboarding@resend.dev'),
    };
  }

  /**
   * Direct send used by the diagnostic endpoint — returns the raw Resend
   * response so we can see exactly what the API reported (delivery id on
   * success, error code+message on failure).
   */
  static async sendDiagnosticTestEmail(to: string) {
    if (!resend) {
      return { ok: false, error: 'RESEND_API_KEY is not configured on this server' };
    }
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'BookDigest email diagnostic test',
        text: `If you received this, Resend can deliver email from ${FROM_EMAIL} to ${to}.\nSent at ${new Date().toISOString()}.`,
      });
      return {
        ok: !result.error,
        id: result.data?.id ?? null,
        error: result.error ? `${result.error.name}: ${result.error.message}` : null,
      };
    } catch (err: any) {
      return { ok: false, error: err?.message ?? String(err) };
    }
  }

  /**
   * Welcome email for the newsletter-popup signup. Different audience from
   * sendWelcomeEmail (which is for registered users) — the subscriber has
   * NOT created an account, so the CTA is to browse the library and to
   * register, not to start reading.
   */
  static async sendNewsletterWelcome(email: string, language: Lang = 'en') {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping newsletter welcome');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: 'Welcome to BookDigest — your first 3 summaries are on us 📚',
        header: '📚 Welcome to BookDigest',
        greeting: 'Hey,',
        intro: "Thanks for signing up. You're now on the list — you'll hear from us when we add the books most readers ask for, and when we ship features worth your time.",
        cta1: 'Want to start reading right now? Create a free account and you get <strong>3 summaries this month</strong>, no credit card needed:',
        ctaButton: 'Create free account →',
        cta2: "Or browse what's on the shelf:",
        ctaLink: 'Browse 900+ summaries',
        reply: 'Hit reply if you want to suggest a book — I read every message.',
        sign: '— Eric, BookDigest',
      },
      de: {
        subject: 'Willkommen bei BookDigest — deine ersten 3 Zusammenfassungen gehen auf uns 📚',
        header: '📚 Willkommen bei BookDigest',
        greeting: 'Hallo,',
        intro: 'Danke für deine Anmeldung. Du stehst jetzt auf der Liste — du hörst von uns, sobald wir neue Bücher hinzufügen oder Features veröffentlichen, die deine Zeit wert sind.',
        cta1: 'Direkt loslesen? Erstelle ein kostenloses Konto und du bekommst <strong>3 Zusammenfassungen pro Monat</strong>, keine Kreditkarte nötig:',
        ctaButton: 'Kostenloses Konto erstellen →',
        cta2: 'Oder schau dich erstmal um:',
        ctaLink: 'Über 900 Zusammenfassungen durchstöbern',
        reply: 'Antworte auf diese Mail, wenn du ein Buch vorschlagen möchtest — ich lese jede Nachricht.',
        sign: '— Eric, BookDigest',
      },
    });

    try {
      const result = await resend!.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.intro}</p>
                <p>${tmpl.cta1}</p>
                <p style="text-align: center;">
                  <a href="${SITE_URL}/register" class="button">${tmpl.ctaButton}</a>
                </p>
                <p>${tmpl.cta2}</p>
                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" style="color: #2563eb;">${tmpl.ctaLink}</a>
                </p>
                <p style="font-size: 14px; color: #6b7280;">${tmpl.reply}</p>
                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      if (result.error) {
        console.error('❌ Newsletter welcome Resend error:', result.error);
        return { success: false, error: `${result.error.name}: ${result.error.message}` };
      }
      console.log(`✅ Newsletter welcome sent to ${email} (id: ${result.data?.id})`);
      return { success: true, id: result.data?.id };
    } catch (err: any) {
      console.error('❌ Failed to send newsletter welcome:', err);
      return { success: false, error: err?.message ?? String(err) };
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(user: { email: string; firstName: string }, language: Lang = 'en') {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping welcome email');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: 'Welcome to BookDigest! 🎉',
        header: '📚 Welcome to BookDigest!',
        greeting: `Hi ${user.firstName}! 👋`,
        intro: `Thanks for joining BookDigest! You now have access to <strong>900+ AI-powered book summaries</strong> from the world's best business, self-help, and personal development books.`,
        feat1: '📖 <strong>3 Free Summaries Per Month</strong> - Start learning today!',
        feat2: '⚡ <strong>15-Minute Reads</strong> - Get key insights fast',
        feat3: '🎧 <strong>Audio Narrations</strong> - Listen on the go (Premium)',
        feat4: '⭐ <strong>Save Favorites</strong> - Build your personal library',
        feat5: '📊 <strong>Track Progress</strong> - See how much you\'ve learned',
        button: 'Start Reading Now →',
        catTitle: 'Popular Categories:',
        cat1: 'Business & Leadership',
        cat2: 'Self-Help & Motivation',
        cat3: 'Productivity & Time Management',
        cat4: 'Personal Finance',
        cat5: 'Health & Wellness',
        help: "Need help? Just reply to this email and we'll be happy to assist!",
        sign: 'Happy reading! 📚<br>The BookDigest Team',
        footer: 'BookDigest - Learn from the best books in 15 minutes',
      },
      de: {
        subject: 'Willkommen bei BookDigest! 🎉',
        header: '📚 Willkommen bei BookDigest!',
        greeting: `Hallo ${user.firstName}! 👋`,
        intro: `Danke, dass du dich bei BookDigest angemeldet hast! Du hast jetzt Zugriff auf <strong>über 900 KI-gestützte Buchzusammenfassungen</strong> aus den besten Wirtschafts-, Selbsthilfe- und Persönlichkeitsentwicklungsbüchern der Welt.`,
        feat1: '📖 <strong>3 kostenlose Zusammenfassungen pro Monat</strong> - Fang heute an zu lernen!',
        feat2: '⚡ <strong>15-Minuten-Lektüre</strong> - Die wichtigsten Erkenntnisse schnell',
        feat3: '🎧 <strong>Audio-Erzählungen</strong> - Unterwegs anhören (Premium)',
        feat4: '⭐ <strong>Favoriten speichern</strong> - Baue deine persönliche Bibliothek',
        feat5: '📊 <strong>Fortschritt verfolgen</strong> - Sieh, wie viel du gelernt hast',
        button: 'Jetzt mit dem Lesen anfangen →',
        catTitle: 'Beliebte Kategorien:',
        cat1: 'Wirtschaft & Führung',
        cat2: 'Selbsthilfe & Motivation',
        cat3: 'Produktivität & Zeitmanagement',
        cat4: 'Finanzen',
        cat5: 'Gesundheit & Wohlbefinden',
        help: 'Brauchst du Hilfe? Antworte einfach auf diese E-Mail und wir helfen dir gerne weiter!',
        sign: 'Viel Spaß beim Lesen! 📚<br>Das BookDigest-Team',
        footer: 'BookDigest - Lerne von den besten Büchern in 15 Minuten',
      },
    });

    try {
      const result = await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .feature-item:last-child { border-bottom: none; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <h2>${tmpl.greeting}</h2>
                <p>${tmpl.intro}</p>

                <div class="feature-list">
                  <div class="feature-item">${tmpl.feat1}</div>
                  <div class="feature-item">${tmpl.feat2}</div>
                  <div class="feature-item">${tmpl.feat3}</div>
                  <div class="feature-item">${tmpl.feat4}</div>
                  <div class="feature-item">${tmpl.feat5}</div>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/categories" class="button">${tmpl.button}</a>
                </p>

                <p><strong>${tmpl.catTitle}</strong></p>
                <ul>
                  <li>${tmpl.cat1}</li>
                  <li>${tmpl.cat2}</li>
                  <li>${tmpl.cat3}</li>
                  <li>${tmpl.cat4}</li>
                  <li>${tmpl.cat5}</li>
                </ul>

                <p>${tmpl.help}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <p>${tmpl.footer}<br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (result.error) {
        console.error(`❌ Welcome email rejected by Resend for ${user.email}:`, result.error);
        return { success: false, error: `${result.error.name}: ${result.error.message}` };
      }
      console.log(`✅ Welcome email sent to ${user.email} (id: ${result.data?.id})`);
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error };
    }
  }

  /**
   * Schedule the Day-3 "discovery" email — sent 3 days after signup.
   * Re-engages users who haven't returned by suggesting popular books.
   */
  static async scheduleDay3Email(user: { email: string; firstName: string }, language: Lang = 'en') {
    if (!isEmailEnabled()) return { success: false, error: 'Email service not configured' };

    const tmpl = pick(language, {
      en: {
        subject: `${user.firstName}, 5 books most readers start with 📚`,
        header: '📚 Where most people start',
        greeting: `Hi ${user.firstName},`,
        intro: `You signed up a few days ago — welcome again. New readers always ask the same question: <em>"Out of 900+ books, where do I start?"</em>`,
        leadIn: 'Here are 5 that consistently get readers hooked:',
        b1Title: 'Atomic Habits — James Clear',
        b1Takeaway: 'Why tiny changes compound, and how to design systems that make good habits automatic.',
        b2Title: 'The Book Thief — Markus Zusak',
        b2Takeaway: "Death narrates a girl's story in WWII Germany. One of the most-read books on the platform.",
        b3Title: 'Me Before You — Jojo Moyes',
        b3Takeaway: 'A story about choosing how to live. Short, devastating, unforgettable.',
        b4Title: 'The Subtle Art of Not Giving a F*ck — Mark Manson',
        b4Takeaway: 'A counterintuitive approach to figuring out what actually matters to you.',
        b5Title: 'The Art of Racing in the Rain — Garth Stein',
        b5Takeaway: "Told from a dog's perspective. Funny, philosophical, devastating.",
        button: 'Browse all 900+ summaries →',
        reply: 'Reply to this email if you want a personal recommendation — I read every message.',
        sign: 'Happy reading,<br>The BookDigest Team',
      },
      de: {
        subject: `${user.firstName}, mit diesen 5 Büchern fangen die meisten an 📚`,
        header: '📚 Wo die meisten anfangen',
        greeting: `Hallo ${user.firstName},`,
        intro: `Du hast dich vor ein paar Tagen angemeldet — nochmals willkommen. Neue Leser fragen immer dasselbe: <em>"Bei 900+ Büchern, wo soll ich anfangen?"</em>`,
        leadIn: 'Hier sind 5, die Leser regelmäßig begeistern:',
        b1Title: 'Die 1%-Methode — James Clear',
        b1Takeaway: 'Wie sich kleinste Veränderungen aufsummieren und wie du Systeme baust, die gute Gewohnheiten automatisch machen.',
        b2Title: 'Die Bücherdiebin — Markus Zusak',
        b2Takeaway: 'Der Tod erzählt die Geschichte eines Mädchens im Deutschland des Zweiten Weltkriegs. Eines der meistgelesenen Bücher auf der Plattform.',
        b3Title: 'Ein ganzes halbes Jahr — Jojo Moyes',
        b3Takeaway: 'Eine Geschichte darüber, wie man leben will. Kurz, niederschmetternd, unvergesslich.',
        b4Title: 'Die subtile Kunst des darauf Scheißens — Mark Manson',
        b4Takeaway: 'Ein gegenintuitiver Ansatz, um herauszufinden, was dir wirklich wichtig ist.',
        b5Title: 'Enzos Welt — Garth Stein',
        b5Takeaway: 'Aus der Perspektive eines Hundes erzählt. Witzig, philosophisch, niederschmetternd.',
        button: 'Alle 900+ Zusammenfassungen durchstöbern →',
        reply: 'Antworte auf diese E-Mail, wenn du eine persönliche Empfehlung möchtest — ich lese jede Nachricht.',
        sign: 'Viel Spaß beim Lesen,<br>Das BookDigest-Team',
      },
    });

    const scheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const result = await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        scheduledAt,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .book { background: white; padding: 16px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #2563eb; }
              .book-title { font-weight: bold; color: #1e40af; }
              .book-takeaway { font-size: 14px; color: #6b7280; margin: 6px 0 0; }
              .button { background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.intro}</p>
                <p>${tmpl.leadIn}</p>

                <div class="book"><div class="book-title">${tmpl.b1Title}</div><div class="book-takeaway">${tmpl.b1Takeaway}</div></div>
                <div class="book"><div class="book-title">${tmpl.b2Title}</div><div class="book-takeaway">${tmpl.b2Takeaway}</div></div>
                <div class="book"><div class="book-title">${tmpl.b3Title}</div><div class="book-takeaway">${tmpl.b3Takeaway}</div></div>
                <div class="book"><div class="book-title">${tmpl.b4Title}</div><div class="book-takeaway">${tmpl.b4Takeaway}</div></div>
                <div class="book"><div class="book-title">${tmpl.b5Title}</div><div class="book-takeaway">${tmpl.b5Takeaway}</div></div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" class="button">${tmpl.button}</a>
                </p>

                <p style="font-size: 14px; color: #6b7280;">${tmpl.reply}</p>
                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`📬 Day-3 email scheduled for ${user.email} [${language}] (id: ${result.data?.id})`);
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ Failed to schedule Day-3 email:', error);
      return { success: false, error };
    }
  }

  /**
   * Schedule the Day-7 "upgrade nudge" email — sent 7 days after signup.
   * Pitches the 7-day free trial / annual plan to free users.
   */
  static async scheduleDay7Email(user: { email: string; firstName: string }, language: Lang = 'en') {
    if (!isEmailEnabled()) return { success: false, error: 'Email service not configured' };

    const tmpl = pick(language, {
      en: {
        subject: `${user.firstName}, want unlimited access? (7-day free trial inside)`,
        header: "One week in — how's it going?",
        greeting: `Hi ${user.firstName},`,
        intro: "You've been with BookDigest for a week. If you've been reading, you've probably hit the 3-summary free monthly limit.",
        leadIn: "Here's what Premium unlocks:",
        row1Label: 'Book summaries per month',
        row1Value: '<span class="no">3</span> → <span class="yes">Unlimited</span>',
        row2Label: 'Real audio narration (220 books)',
        row3Label: 'Offline reading',
        row4Label: 'Ad-free experience',
        row5Label: 'Early access to new summaries',
        rowIncluded: '✓ Included',
        cardKicker: 'Try Premium free for 7 days',
        cardPrice: '€79.99/year',
        cardSubprice: "That's €6.67/month — half the price of Blinkist",
        cardButton: 'Start free trial →',
        noCharge: 'No charges during the trial. Cancel anytime.',
        notReady: 'Not ready? No problem — your free 3 summaries refresh next month.',
        sign: 'Either way, thanks for being here.<br>The BookDigest Team',
      },
      de: {
        subject: `${user.firstName}, willst du unbegrenzten Zugang? (7 Tage kostenlos testen)`,
        header: 'Eine Woche bei BookDigest — wie läuft es?',
        greeting: `Hallo ${user.firstName},`,
        intro: 'Du bist jetzt seit einer Woche bei BookDigest. Wenn du fleißig gelesen hast, hast du wahrscheinlich dein Gratis-Limit von 3 Zusammenfassungen pro Monat erreicht.',
        leadIn: 'Das schaltet Premium frei:',
        row1Label: 'Zusammenfassungen pro Monat',
        row1Value: '<span class="no">3</span> → <span class="yes">Unbegrenzt</span>',
        row2Label: 'Echte Audio-Erzählung (220 Bücher)',
        row3Label: 'Offline-Lesen',
        row4Label: 'Werbefrei',
        row5Label: 'Früher Zugriff auf neue Zusammenfassungen',
        rowIncluded: '✓ Enthalten',
        cardKicker: 'Premium 7 Tage kostenlos testen',
        cardPrice: '79,99 €/Jahr',
        cardSubprice: 'Das sind 6,67 €/Monat — halb so teuer wie Blinkist',
        cardButton: 'Kostenlosen Test starten →',
        noCharge: 'Keine Abbuchung während des Tests. Jederzeit kündbar.',
        notReady: 'Noch nicht bereit? Kein Problem — deine 3 Gratis-Zusammenfassungen erneuern sich nächsten Monat.',
        sign: 'So oder so, danke, dass du dabei bist.<br>Das BookDigest-Team',
      },
    });

    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const result = await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        scheduledAt,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .compare { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .compare-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .compare-row:last-child { border-bottom: none; }
              .compare-row .yes { color: #10b981; font-weight: bold; }
              .compare-row .no { color: #ef4444; }
              .pricing-card { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 24px; border-radius: 10px; text-align: center; margin: 24px 0; }
              .button { background: white; color: #1e40af; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: bold; }
              .secondary { font-size: 14px; opacity: 0.85; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.intro}</p>

                <p>${tmpl.leadIn}</p>

                <div class="compare">
                  <div class="compare-row"><span>${tmpl.row1Label}</span><span>${tmpl.row1Value}</span></div>
                  <div class="compare-row"><span>${tmpl.row2Label}</span><span class="yes">${tmpl.rowIncluded}</span></div>
                  <div class="compare-row"><span>${tmpl.row3Label}</span><span class="yes">${tmpl.rowIncluded}</span></div>
                  <div class="compare-row"><span>${tmpl.row4Label}</span><span class="yes">${tmpl.rowIncluded}</span></div>
                  <div class="compare-row"><span>${tmpl.row5Label}</span><span class="yes">${tmpl.rowIncluded}</span></div>
                </div>

                <div class="pricing-card">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">${tmpl.cardKicker}</p>
                  <h2 style="margin: 8px 0; font-size: 32px;">${tmpl.cardPrice}</h2>
                  <p class="secondary" style="margin: 0;">${tmpl.cardSubprice}</p>
                  <a href="${SITE_URL}/pricing" class="button">${tmpl.cardButton}</a>
                </div>

                <p style="font-size: 14px; color: #6b7280; text-align: center;">${tmpl.noCharge}</p>

                <p style="margin-top: 30px;">${tmpl.notReady}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`📬 Day-7 email scheduled for ${user.email} [${language}] (id: ${result.data?.id})`);
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ Failed to schedule Day-7 email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(
    user: { email: string; firstName: string },
    payment: { amount: number; plan: string; currency?: string },
    language: Lang = 'en'
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping payment confirmation');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: 'Payment Confirmed - Welcome to Premium! 💳',
        headerTitle: `🎉 Thank You ${user.firstName}!`,
        headerSub: 'Your payment has been confirmed',
        intro: 'Your premium subscription is now active! Welcome to unlimited book summaries.',
        receiptTitle: 'Payment Receipt',
        rowPlan: 'Plan:',
        rowAmount: 'Amount:',
        rowDate: 'Date:',
        rowTotal: 'Total Paid:',
        benefitsTitle: 'Your Premium Benefits:',
        b1: '✅ <strong>Unlimited Access</strong> - Read all 900+ summaries',
        b2: '✅ <strong>Audio Narrations</strong> - Listen to summaries',
        b3: '✅ <strong>Offline Downloads</strong> - Read anywhere',
        b4: '✅ <strong>Ad-Free Experience</strong> - Distraction-free reading',
        b5: '✅ <strong>Early Access</strong> - New summaries first',
        b6: '✅ <strong>Priority Support</strong> - Faster help when needed',
        button: 'Browse All Books →',
        outro: "Thank you for supporting BookDigest! We're excited to be part of your learning journey.",
        sign: 'Best regards,<br>The BookDigest Team',
        footer: 'Need help? Reply to this email or visit our',
        supportLink: 'support page',
        dateLocale: 'en-US',
      },
      de: {
        subject: 'Zahlung bestätigt - Willkommen bei Premium! 💳',
        headerTitle: `🎉 Danke, ${user.firstName}!`,
        headerSub: 'Deine Zahlung ist bestätigt',
        intro: 'Dein Premium-Abo ist jetzt aktiv! Willkommen zu unbegrenzten Buchzusammenfassungen.',
        receiptTitle: 'Zahlungsbeleg',
        rowPlan: 'Plan:',
        rowAmount: 'Betrag:',
        rowDate: 'Datum:',
        rowTotal: 'Bezahlt:',
        benefitsTitle: 'Deine Premium-Vorteile:',
        b1: '✅ <strong>Unbegrenzter Zugriff</strong> - Alle 900+ Zusammenfassungen',
        b2: '✅ <strong>Audio-Erzählungen</strong> - Zusammenfassungen anhören',
        b3: '✅ <strong>Offline-Downloads</strong> - Überall lesen',
        b4: '✅ <strong>Werbefrei</strong> - Ungestört lesen',
        b5: '✅ <strong>Früher Zugriff</strong> - Neue Zusammenfassungen zuerst',
        b6: '✅ <strong>Vorrangiger Support</strong> - Schnellere Hilfe bei Bedarf',
        button: 'Alle Bücher durchstöbern →',
        outro: 'Danke, dass du BookDigest unterstützt! Wir freuen uns, ein Teil deiner Lernreise zu sein.',
        sign: 'Beste Grüße,<br>Das BookDigest-Team',
        footer: 'Brauchst du Hilfe? Antworte auf diese E-Mail oder besuche unsere',
        supportLink: 'Support-Seite',
        dateLocale: 'de-DE',
      },
    });

    try {
      const currency = payment.currency || '€';

      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
              .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-weight: bold; font-size: 18px; }
              .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .benefit-item { padding: 8px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.headerTitle}</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">${tmpl.headerSub}</p>
              </div>
              <div class="content">
                <p>${tmpl.intro}</p>

                <div class="receipt">
                  <h3 style="margin-top: 0;">${tmpl.receiptTitle}</h3>
                  <div class="receipt-row"><span>${tmpl.rowPlan}</span><strong>${payment.plan}</strong></div>
                  <div class="receipt-row"><span>${tmpl.rowAmount}</span><strong>${currency}${payment.amount.toFixed(2)}</strong></div>
                  <div class="receipt-row"><span>${tmpl.rowDate}</span><strong>${new Date().toLocaleDateString(tmpl.dateLocale)}</strong></div>
                  <div class="receipt-row total"><span>${tmpl.rowTotal}</span><span>${currency}${payment.amount.toFixed(2)}</span></div>
                </div>

                <div class="benefits">
                  <h3>${tmpl.benefitsTitle}</h3>
                  <div class="benefit-item">${tmpl.b1}</div>
                  <div class="benefit-item">${tmpl.b2}</div>
                  <div class="benefit-item">${tmpl.b3}</div>
                  <div class="benefit-item">${tmpl.b4}</div>
                  <div class="benefit-item">${tmpl.b5}</div>
                  <div class="benefit-item">${tmpl.b6}</div>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" class="button">${tmpl.button}</a>
                </p>

                <p>${tmpl.outro}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <p>${tmpl.footer} <a href="${SITE_URL}/contact">${tmpl.supportLink}</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Payment confirmation sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send payment confirmation:', error);
      return { success: false, error };
    }
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailed(user: { email: string; firstName: string }, language: Lang = 'en') {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping payment failed email');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: '⚠️ Payment Failed - Action Required',
        header: '⚠️ Payment Failed',
        greeting: `Hi ${user.firstName},`,
        intro: 'We were unable to process your subscription payment.',
        warningPrefix: '⏰ Action Required:',
        warningBody: 'Your subscription will be cancelled in <strong>3 days</strong> if payment is not received.',
        reasonsTitle: 'Common reasons for payment failure:',
        r1: 'Expired credit card',
        r2: 'Insufficient funds',
        r3: 'Card issuer declined the transaction',
        r4: 'Incorrect billing information',
        button: 'Update Payment Method →',
        retry: "Once you update your payment method, we'll automatically retry the payment.",
        help: "If you have any questions or need help, please don't hesitate to contact us.",
        sign: 'Best regards,<br>The BookDigest Team',
        footer: 'Need help?',
        supportLink: 'Contact Support',
      },
      de: {
        subject: '⚠️ Zahlung fehlgeschlagen - Aktion erforderlich',
        header: '⚠️ Zahlung fehlgeschlagen',
        greeting: `Hallo ${user.firstName},`,
        intro: 'Wir konnten deine Abozahlung nicht verarbeiten.',
        warningPrefix: '⏰ Aktion erforderlich:',
        warningBody: 'Dein Abo wird in <strong>3 Tagen</strong> gekündigt, wenn keine Zahlung eingeht.',
        reasonsTitle: 'Häufige Gründe für fehlgeschlagene Zahlungen:',
        r1: 'Abgelaufene Kreditkarte',
        r2: 'Unzureichende Deckung',
        r3: 'Karte vom Aussteller abgelehnt',
        r4: 'Falsche Rechnungsdaten',
        button: 'Zahlungsmethode aktualisieren →',
        retry: 'Sobald du deine Zahlungsmethode aktualisiert hast, versuchen wir die Zahlung automatisch erneut.',
        help: 'Bei Fragen oder Problemen melde dich gerne bei uns.',
        sign: 'Beste Grüße,<br>Das BookDigest-Team',
        footer: 'Brauchst du Hilfe?',
        supportLink: 'Support kontaktieren',
      },
    });

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.intro}</p>

                <div class="warning-box">
                  <strong>${tmpl.warningPrefix}</strong> ${tmpl.warningBody}
                </div>

                <p><strong>${tmpl.reasonsTitle}</strong></p>
                <ul>
                  <li>${tmpl.r1}</li>
                  <li>${tmpl.r2}</li>
                  <li>${tmpl.r3}</li>
                  <li>${tmpl.r4}</li>
                </ul>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/dashboard" class="button">${tmpl.button}</a>
                </p>

                <p>${tmpl.retry}</p>

                <p>${tmpl.help}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <p>${tmpl.footer} <a href="${SITE_URL}/contact">${tmpl.supportLink}</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Payment failed email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send payment failed email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send renewal reminder (3 days before renewal)
   */
  static async sendRenewalReminder(
    user: { email: string; firstName: string },
    subscription: { amount: number; plan: string; renewalDate: Date; currency?: string },
    language: Lang = 'en'
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping renewal reminder');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: '🔔 Your Subscription Renews in 3 Days',
        header: '🔔 Subscription Renewal Reminder',
        greeting: `Hi ${user.firstName},`,
        intro: 'Your BookDigest premium subscription will automatically renew in <strong>3 days</strong>.',
        detailsTitle: 'Renewal Details:',
        rowPlan: 'Plan:',
        rowAmount: 'Amount:',
        rowDate: 'Renewal Date:',
        noAction: '<strong>No action needed!</strong> Your subscription will automatically renew using your saved payment method.',
        wantChanges: 'Want to make changes?',
        btnUpdate: 'Update Payment Method',
        btnCancel: 'Cancel Subscription',
        outro: 'Thank you for being a premium member! We appreciate your continued support.',
        sign: 'Best regards,<br>The BookDigest Team',
        footer: 'Questions?',
        supportLink: 'Contact Us',
        dateLocale: 'en-US',
      },
      de: {
        subject: '🔔 Dein Abo verlängert sich in 3 Tagen',
        header: '🔔 Erinnerung zur Abo-Verlängerung',
        greeting: `Hallo ${user.firstName},`,
        intro: 'Dein BookDigest-Premium-Abo verlängert sich in <strong>3 Tagen</strong> automatisch.',
        detailsTitle: 'Verlängerungsdetails:',
        rowPlan: 'Plan:',
        rowAmount: 'Betrag:',
        rowDate: 'Verlängerungsdatum:',
        noAction: '<strong>Keine Aktion erforderlich!</strong> Dein Abo verlängert sich automatisch mit der hinterlegten Zahlungsmethode.',
        wantChanges: 'Möchtest du etwas ändern?',
        btnUpdate: 'Zahlungsmethode aktualisieren',
        btnCancel: 'Abo kündigen',
        outro: 'Danke, dass du Premium-Mitglied bist! Wir schätzen deine fortlaufende Unterstützung.',
        sign: 'Beste Grüße,<br>Das BookDigest-Team',
        footer: 'Fragen?',
        supportLink: 'Kontakt',
        dateLocale: 'de-DE',
      },
    });

    try {
      const currency = subscription.currency || '€';

      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb; }
              .info-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .info-row:last-child { border-bottom: none; }
              .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
              .button-secondary { background: #6b7280; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.intro}</p>

                <div class="info-box">
                  <h3 style="margin-top: 0;">${tmpl.detailsTitle}</h3>
                  <div class="info-row"><strong>${tmpl.rowPlan}</strong> ${subscription.plan}</div>
                  <div class="info-row"><strong>${tmpl.rowAmount}</strong> ${currency}${subscription.amount.toFixed(2)}</div>
                  <div class="info-row"><strong>${tmpl.rowDate}</strong> ${subscription.renewalDate.toLocaleDateString(tmpl.dateLocale)}</div>
                </div>

                <p>${tmpl.noAction}</p>

                <p>${tmpl.wantChanges}</p>
                <p style="text-align: center;">
                  <a href="${SITE_URL}/dashboard" class="button">${tmpl.btnUpdate}</a>
                  <a href="${SITE_URL}/subscription/cancel" class="button button-secondary">${tmpl.btnCancel}</a>
                </p>

                <p>${tmpl.outro}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <p>${tmpl.footer} <a href="${SITE_URL}/contact">${tmpl.supportLink}</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Renewal reminder sent to ${user.email} [${language}]`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send renewal reminder:', error);
      return { success: false, error };
    }
  }

  /**
   * Send free tier limit reached notification
   */
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user: { email: string; firstName: string; resetUrl: string }, language: Lang = 'en') {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping password reset email');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: '🔐 Reset Your Password - BookDigest',
        header: '🔐 Reset Your Password',
        greeting: `Hi ${user.firstName},`,
        intro: 'We received a request to reset your password for your BookDigest account.',
        button: 'Reset Password →',
        copyLine: 'Or copy and paste this link into your browser:',
        expires: '⏰ This link expires in 1 hour',
        notYouTitle: "Didn't request this?",
        notYouBody: "If you didn't request a password reset, please ignore this email. Your password will remain unchanged.",
        secTitle: 'For security reasons:',
        sec1: 'Never share this link with anyone',
        sec2: "We'll never ask for your password via email",
        sec3: 'This link can only be used once',
        help: "Need help? Reply to this email and we'll assist you!",
        sign: 'Best regards,<br>The BookDigest Team',
        footer: 'BookDigest - Learn from the best books in 15 minutes',
      },
      de: {
        subject: '🔐 Passwort zurücksetzen - BookDigest',
        header: '🔐 Passwort zurücksetzen',
        greeting: `Hallo ${user.firstName},`,
        intro: 'Wir haben eine Anfrage erhalten, das Passwort für dein BookDigest-Konto zurückzusetzen.',
        button: 'Passwort zurücksetzen →',
        copyLine: 'Oder kopiere diesen Link in deinen Browser:',
        expires: '⏰ Dieser Link läuft in 1 Stunde ab',
        notYouTitle: 'Du hast das nicht angefragt?',
        notYouBody: 'Wenn du kein Passwort-Zurücksetzen angefragt hast, ignoriere diese Mail einfach. Dein Passwort bleibt unverändert.',
        secTitle: 'Aus Sicherheitsgründen:',
        sec1: 'Teile diesen Link mit niemandem',
        sec2: 'Wir werden dich niemals per E-Mail nach deinem Passwort fragen',
        sec3: 'Dieser Link kann nur einmal verwendet werden',
        help: 'Brauchst du Hilfe? Antworte auf diese E-Mail und wir helfen dir!',
        sign: 'Beste Grüße,<br>Das BookDigest-Team',
        footer: 'BookDigest - Lerne von den besten Büchern in 15 Minuten',
      },
    });

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.intro}</p>

                <p style="text-align: center;">
                  <a href="${user.resetUrl}" class="button">${tmpl.button}</a>
                </p>

                <p>${tmpl.copyLine}</p>
                <p style="background: white; padding: 15px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #4b5563;">
                  ${user.resetUrl}
                </p>

                <div class="warning-box">
                  <strong>${tmpl.expires}</strong>
                </div>

                <p><strong>${tmpl.notYouTitle}</strong></p>
                <p>${tmpl.notYouBody}</p>

                <p>${tmpl.secTitle}</p>
                <ul>
                  <li>${tmpl.sec1}</li>
                  <li>${tmpl.sec2}</li>
                  <li>${tmpl.sec3}</li>
                </ul>

                <p>${tmpl.help}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <p>${tmpl.footer}<br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Password reset email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send streak milestone celebration when a user hits 3 / 7 / 30 / 100 day streak.
   * Triggered from progress.controller when computeUpdatedStreak crosses a threshold.
   */
  static async sendStreakMilestone(
    user: { email: string; firstName: string },
    days: number,
    language: Lang = 'en'
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping streak milestone email');
      return { success: false, error: 'Email service not configured' };
    }

    const messageMap = pick(language, {
      en: {
        3:   { headline: "You're on a 3-day streak 🔥",   body: "Three days in a row. Most people quit on day 2 — you didn't. Keep going: 4 days locks in the habit, 7 days makes it part of who you are." },
        7:   { headline: 'One full week. 7-day streak 🔥🔥', body: "A week of consistent reading. Research shows 7 days is where new habits stop feeling like effort. Next stop: 30 days." },
        30:  { headline: "30 days. You're a different reader now 🏆", body: "Thirty consecutive days. That's not a streak — that's an identity. Most people don't read 30 books in a year. You've now built the system that makes it inevitable." },
        100: { headline: '100-DAY STREAK. 🏆🏆🏆', body: "One hundred days. Hit reply and tell us what you've read — we want to feature you. This is the rarest milestone on BookDigest." },
      } as Record<number, { headline: string; body: string }>,
      de: {
        3:   { headline: '3 Tage in Folge 🔥', body: 'Drei Tage hintereinander. Die meisten geben am zweiten Tag auf — du nicht. Bleib dran: 4 Tage verankern die Gewohnheit, 7 Tage machen sie zu einem Teil von dir.' },
        7:   { headline: 'Eine ganze Woche. 7-Tage-Serie 🔥🔥', body: 'Eine Woche konsequent gelesen. Forschung zeigt: Nach 7 Tagen fühlt sich eine neue Gewohnheit nicht mehr nach Anstrengung an. Nächstes Ziel: 30 Tage.' },
        30:  { headline: '30 Tage. Du bist jetzt ein anderer Leser 🏆', body: 'Dreißig Tage in Folge. Das ist keine Serie mehr — das ist Identität. Die meisten Menschen lesen in einem Jahr keine 30 Bücher. Du hast jetzt das System gebaut, das es unvermeidlich macht.' },
        100: { headline: '100-TAGE-SERIE. 🏆🏆🏆', body: 'Hundert Tage. Antworte auf diese Mail und erzähl uns, was du gelesen hast — wir würden dich gerne vorstellen. Das ist der seltenste Meilenstein auf BookDigest.' },
      } as Record<number, { headline: string; body: string }>,
    });
    const msg = messageMap[days];
    if (!msg) return { success: false, error: `No template for ${days}-day milestone` };

    const labels = pick(language, {
      en: { greeting: `Hi ${user.firstName},`, dayLabel: 'DAY STREAK', button: 'Keep the streak alive →', sign: 'Proud of you,<br>The BookDigest Team' },
      de: { greeting: `Hallo ${user.firstName},`, dayLabel: 'TAGE-SERIE', button: 'Halte die Serie am Leben →', sign: 'Wir sind stolz auf dich,<br>Das BookDigest-Team' },
    });

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: msg.headline,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .streak-num { font-size: 72px; font-weight: bold; line-height: 1; margin: 0; }
              .streak-label { font-size: 18px; opacity: 0.95; margin: 8px 0 0; letter-spacing: 1px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="streak-num">${days}</p>
                <p class="streak-label">${labels.dayLabel}</p>
              </div>
              <div class="content">
                <h2>${msg.headline}</h2>
                <p>${labels.greeting}</p>
                <p>${msg.body}</p>
                <p style="text-align: center;">
                  <a href="${SITE_URL}/dashboard" class="button">${labels.button}</a>
                </p>
                <p>${labels.sign}</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`✅ Streak milestone (${days}d) sent to ${user.email} [${language}]`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send streak milestone email:', error);
      return { success: false, error };
    }
  }

  /**
   * Warn a user that their streak is about to break (haven't read today, end of day approaching).
   * Triggered from the daily streak-warning cron job.
   */
  static async sendStreakAtRisk(
    user: { email: string; firstName: string },
    currentStreak: number,
    language: Lang = 'en'
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping streak warning');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: `⏰ Your ${currentStreak}-day streak ends at midnight`,
        header: "⏰ Don't lose it now",
        greeting: `Hi ${user.firstName},`,
        body: "You haven't read today, and your streak resets at midnight.",
        dayLabel: "DAYS — DON'T BREAK IT",
        leadIn: 'One 15-minute summary is enough to keep it alive.',
        button: 'Read one now →',
        optOut: `Don't want streak reminders? Reply with "no streak emails" and we'll turn them off for you.`,
        sign: 'The BookDigest Team',
      },
      de: {
        subject: `⏰ Deine ${currentStreak}-Tage-Serie endet um Mitternacht`,
        header: '⏰ Verlier sie jetzt nicht',
        greeting: `Hallo ${user.firstName},`,
        body: 'Du hast heute noch nicht gelesen, und deine Serie wird um Mitternacht zurückgesetzt.',
        dayLabel: 'TAGE — NICHT JETZT AUFGEBEN',
        leadIn: 'Eine 15-Minuten-Zusammenfassung reicht, um die Serie am Leben zu halten.',
        button: 'Jetzt eine lesen →',
        optOut: 'Keine Serien-Erinnerungen mehr? Antworte mit "keine Serien-Mails" und wir schalten sie für dich ab.',
        sign: 'Das BookDigest-Team',
      },
    });

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .streak-box { background: white; padding: 24px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b; }
              .streak-num { font-size: 56px; font-weight: bold; color: #f59e0b; margin: 0; line-height: 1; }
              .streak-label { font-size: 14px; color: #6b7280; margin: 8px 0 0; letter-spacing: 1px; }
              .button { background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 16px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.header}</h1>
              </div>
              <div class="content">
                <p>${tmpl.greeting}</p>
                <p>${tmpl.body}</p>

                <div class="streak-box">
                  <p class="streak-num">${currentStreak}</p>
                  <p class="streak-label">${tmpl.dayLabel}</p>
                </div>

                <p>${tmpl.leadIn}</p>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" class="button">${tmpl.button}</a>
                </p>

                <p style="font-size: 14px; color: #6b7280;">${tmpl.optOut}</p>
                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`✅ Streak warning (${currentStreak}d at risk) sent to ${user.email} [${language}]`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send streak warning email:', error);
      return { success: false, error };
    }
  }

  static async sendFreeTierLimitReached(user: { email: string; firstName: string }, language: Lang = 'en') {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping free tier limit email');
      return { success: false, error: 'Email service not configured' };
    }

    const tmpl = pick(language, {
      en: {
        subject: "🎉 You've Read 3 Summaries! Upgrade to Continue",
        headerTitle: `🎉 Congratulations ${user.firstName}!`,
        headerSub: "You've read 3 book summaries this month",
        intro: "Great job on your learning journey! You've reached your free monthly limit.",
        lead: 'To continue reading and unlock all features, upgrade to Premium:',
        b1: '✅ <strong>Unlimited Summaries</strong> - Read all 900+ books',
        b2: '✅ <strong>Audio Narrations</strong> - Listen on the go',
        b3: '✅ <strong>Offline Downloads</strong> - Read anytime, anywhere',
        b4: '✅ <strong>Ad-Free Experience</strong> - Focus on learning',
        b5: '✅ <strong>Early Access</strong> - New summaries first',
        priceTitle: 'Premium Pricing',
        priceMain: '<strong>€9.99/month</strong> or <strong>€79.99/year</strong>',
        priceSub: 'Save 33% with annual plan!',
        button: 'Upgrade to Premium →',
        outro: 'Your free summaries will reset next month, or upgrade now for unlimited access!',
        sign: 'Happy learning! 📚<br>The BookDigest Team',
        footer: 'Questions?',
      },
      de: {
        subject: '🎉 Du hast 3 Zusammenfassungen gelesen! Jetzt upgraden',
        headerTitle: `🎉 Glückwunsch, ${user.firstName}!`,
        headerSub: 'Du hast diesen Monat 3 Zusammenfassungen gelesen',
        intro: 'Gut gemacht auf deiner Lernreise! Du hast dein kostenloses Monatslimit erreicht.',
        lead: 'Um weiterzulesen und alle Funktionen freizuschalten, hol dir Premium:',
        b1: '✅ <strong>Unbegrenzte Zusammenfassungen</strong> - Alle 900+ Bücher lesen',
        b2: '✅ <strong>Audio-Erzählungen</strong> - Unterwegs anhören',
        b3: '✅ <strong>Offline-Downloads</strong> - Jederzeit und überall lesen',
        b4: '✅ <strong>Werbefrei</strong> - Konzentriert lernen',
        b5: '✅ <strong>Früher Zugriff</strong> - Neue Zusammenfassungen zuerst',
        priceTitle: 'Premium-Preise',
        priceMain: '<strong>9,99 €/Monat</strong> oder <strong>79,99 €/Jahr</strong>',
        priceSub: '33 % sparen mit dem Jahresplan!',
        button: 'Jetzt upgraden →',
        outro: 'Deine Gratis-Zusammenfassungen erneuern sich nächsten Monat — oder upgrade jetzt für unbegrenzten Zugriff!',
        sign: 'Viel Spaß beim Lernen! 📚<br>Das BookDigest-Team',
        footer: 'Fragen?',
      },
    });

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: tmpl.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .benefit-item { padding: 8px 0; }
              .pricing { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tmpl.headerTitle}</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">${tmpl.headerSub}</p>
              </div>
              <div class="content">
                <p>${tmpl.intro}</p>

                <p>${tmpl.lead}</p>

                <div class="benefits">
                  <div class="benefit-item">${tmpl.b1}</div>
                  <div class="benefit-item">${tmpl.b2}</div>
                  <div class="benefit-item">${tmpl.b3}</div>
                  <div class="benefit-item">${tmpl.b4}</div>
                  <div class="benefit-item">${tmpl.b5}</div>
                </div>

                <div class="pricing">
                  <h3 style="margin-top: 0;">${tmpl.priceTitle}</h3>
                  <p style="font-size: 24px; margin: 10px 0;">${tmpl.priceMain}</p>
                  <p style="font-size: 14px; opacity: 0.9;">${tmpl.priceSub}</p>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/pricing" class="button">${tmpl.button}</a>
                </p>

                <p>${tmpl.outro}</p>

                <p>${tmpl.sign}</p>
              </div>
              <div class="footer">
                <p>${tmpl.footer} <a href="${SITE_URL}/contact">Contact Us</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Free tier limit email sent to ${user.email} [${language}]`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send free tier limit email:', error);
      return { success: false, error };
    }
  }
}
