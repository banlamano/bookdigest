
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "The Happiness Project": {
    "en": {
      "summary": "Gretchen Rubin's *The Happiness Project* is a relatable and practical chronicle of a year spent test-driving various theories and research on how to be happier. Rubin realizes that 'the days are long, but the years are short' and decides to dedicate twelve months to specific themes—such as energy, marriage, work, and mindfulness—to see what actually makes a difference in her daily life. The book is a blend of personal memoir, scientific research, and actionable advice, showing that happiness is often found in the small, consistent changes we make to our routines and attitudes.\n\n### Why It Matters\nThis book is significant for its approach to happiness as a project that requires planning and effort, rather than a passive state of mind. It matters because it provides a framework for readers to conduct their own 'happiness experiments' based on their individual values and circumstances. For readers, Rubin’s honesty about her own flaws and the mixed results of her resolutions makes the book highly relatable. It highlights the importance of self-knowledge—knowing what actually brings you joy rather than what you *think* should. It is a motivating read that proves that even a few small changes can lead to a significant increase in overall life satisfaction.\n\n### The Final Takeaway\nHappiness is a skill that can be practiced and improved through intentional habits. You don't need a major life overhaul to be happier; you just need to identify the 'small things' that affect your mood and address them systematically. What you do every day matters more than what you do every once in a while. Be Gretchen, but in your own way.",
      "keyInsights": [
        { "title": "The First Splendid Truth", "explanation": "To be happy, you need to feel good, to stop feeling bad, and to have a reason for right growth. This requires addressing both physical energy and emotional well-being.", "example": "Rubin's first month focus on getting more sleep and de-cluttering her home to boost her baseline energy.", "impact": "Provides a clear starting point for self-improvement." },
        { "title": "Self-Knowledge is the Foundation", "explanation": "You cannot find happiness by following someone else's definition of it. You must understand your own temperament, values, and 'personal commandments'.", "example": "Rubin realizing that she actually likes structure and routine, even though society often celebrates spontaneity.", "impact": "Prevents wasted effort on 'happiness' activities that don't fit your personality." },
        { "title": "Outer Order, Inner Calm", "explanation": "The state of your physical environment has a profound impact on your mental state. Clearing 'life's clutter' can provide immediate emotional relief.", "example": "The 'one-minute rule': if a task takes less than a minute, do it immediately.", "impact": "Reduces daily stress and improves focus." }
      ],
      "chapters": [
        { "number": 1, "title": "January: Vitality", "summary": "Focusing on sleep, exercise, and de-cluttering to build a foundation of energy." },
        { "number": 2, "title": "February: Marriage", "summary": "Improving relationship dynamics by remembering birthdays, quitting nagging, and 'acting' more loving." },
        { "number": 3, "title": "June: Friendship", "summary": "Making time for friends, being generous, and building a community." },
        { "number": 4, "title": "December: Perfect Happiness", "summary": "Reflecting on the year's progress and learning to maintain the habits that stick." }
      ],
      "quotes": [
        "The days are long, but the years are short.",
        "What you do every day matters more than what you do every once in a while.",
        "One of the best ways to make yourself happy is to make other people happy. One of the best ways to make other people happy is to be happy yourself."
      ],
      "actionItems": [
        "Create your own 'Personal Commandments'—a list of 10-12 principles to live by.",
        "Implement the 'One-Minute Rule' today: If it takes less than 60 seconds, do it now.",
        "Identify one 'treat' that consistently makes you happy and schedule it for this week.",
        "De-clutter one drawer or shelf today to experience the relief of 'outer order'."
      ]
    },
    "de": {
      "summary": "In 'Das Happiness-Projekt' beschreibt Gretchen Rubin ihr Selbstexperiment: Ein Jahr lang testet sie jeden Monat neue Strategien, um glücklicher zu werden. Sie widmet sich Themen wie Vitalität, Ehe, Arbeit und Achtsamkeit. Das Buch ist eine Mischung aus persönlichem Bericht und wissenschaftlichen Erkenntnissen und zeigt, dass Glück oft in den kleinen, alltäglichen Gewohnheiten liegt, die wir bewusst pflegen.\n\n### Warum es wichtig ist\nDas Buch macht deutlich, dass Glück kein Zufallsprodukt ist, sondern durch Planung und Disziplin gefördert werden kann. Es bietet einen praktischen Rahmen für eigene 'Glücks-Experimente'. Die zentrale Botschaft: Das, was wir jeden Tag tun, zählt mehr als das, was wir nur gelegentlich tun. Es ermutigt zu mehr Selbsterkenntnis und bewusster Lebensgestaltung.\n\n### Die zentrale Erkenntnis\nGlück ist eine Fähigkeit, die man üben kann. Kleine, konsequente Veränderungen im Alltag führen oft zu einer spürbaren Steigerung der Lebenszufriedenheit. Ordnung im Außen schafft oft Ordnung im Inneren.",
      "keyInsights": [
        { "title": "Äußere Ordnung, innerer Frieden", "explanation": "Ein aufgeräumtes Umfeld reduziert Stress und verbessert die Stimmung sofort.", "example": "Anwendung der 'Ein-Minuten-Regel' (alles, was unter einer Minute dauert, sofort erledigen).", "impact": "Reduziert die tägliche Belastung." },
        { "title": "Selbsterkenntnis als Basis", "explanation": "Man kann nur glücklich werden, wenn man weiß, was einem persönlich wirklich Freude bereitet, statt fremden Idealen nachzueifern.", "impact": "Führt zu authentischeren Lebensentscheidungen." }
      ],
      "chapters": [
        { "number": 1, "title": "Januar: Vitalität", "summary": "Mehr Schlaf und Entrümpeln als Basis für neue Energie." },
        { "number": 2, "title": "Februar: Partnerschaft", "summary": "Kleine Gesten der Wertschätzung und das Ende von Nörgeleien." },
        { "number": 3, "title": "Dezember: Bilanz", "summary": "Integrieren der erfolgreichsten Gewohnheiten in den dauerhaften Alltag." }
      ],
      "quotes": [
        "Was man jeden Tag tut, ist wichtiger als das, was man ab und zu tut.",
        "Die Tage sind lang, aber die Jahre sind kurz."
      ],
      "actionItems": [
        "Führen Sie die 'Ein-Minuten-Regel' ein.",
        "Schreiben Sie Ihre eigenen 'Persönlichen Gebote' auf."
      ]
    }
  },
  "Change Your Thinking, Change Your Life": {
    "en": {
      "summary": "Brian Tracy's *Change Your Thinking, Change Your Life* is a transformative guide to personal success based on the principle that your external world is a reflection of your internal mindset. Tracy explains how to reprogram your subconscious mind by replacing negative self-talk and limiting beliefs with positive, goal-oriented thoughts. The book provides a step-by-step system for setting clear objectives, taking consistent action, and developing the mental toughness required to overcome any obstacle. It is a synthesis of decades of research into psychology, success habits, and high performance.\n\n### Why It Matters\nThis book is significant for its emphasis on the 'Law of Correspondance'—the idea that you can change your reality by changing your mental habits. It matters because it provides practical tools for building self-confidence and mental resilience. For readers, Tracy's clear and repetitive style helps to reinforce the core concepts of personal responsibility and the power of visualization. It highlights the importance of choosing your influences and protecting your mental environment from negativity. It is an essential read for anyone looking to transition from a 'victim' mindset to a 'victor' mindset and unlock their full potential.\n\n### The Final Takeaway\nYou are the architect of your own character and destiny. By taking total control of your thoughts, you take control of your life. Success is not an accident; it is the inevitable result of consistent, positive mental programming and disciplined action. Dream big, set clear goals, and never allow a limiting belief to hold you back.",
      "keyInsights": [
        { "title": "Mental Equivalency", "explanation": "You cannot achieve anything in the physical world that you haven't first successfully visualized and accepted in your mental world. Your dominant thoughts create your reality.", "example": "Consistently visualizing yourself successful in a difficult business negotiation until it feels natural.", "impact": "Accelerates goal attainment." },
        { "title": "The Power of Affirmations", "explanation": "Positive self-talk is the fuel for self-confidence. By repeating empowering statements, you overwrite the negative scripts from your past and prime yourself for success.", "example": "Repeating 'I like myself' or 'I am responsible' to build internal strength.", "impact": "Improves self-esteem and resilience." },
        { "title": "Zero-Based Thinking", "explanation": "Ask yourself: 'Knowing what I know now, would I get into this situation again?' If the answer is no, find a way to get out as quickly as possible. This prevents 'sunk cost' traps.", "example": "Evaluating a failing project or toxic relationship from a fresh perspective.", "impact": "Optimizes time and energy management." }
      ],
      "chapters": [
        { "number": 1, "title": "Change Your Thinking", "summary": "understanding the laws of the mind and how to take control of your mental habits." },
        { "number": 2, "title": "Change Your Life", "summary": "Applying your new mindset to goal setting and financial success." },
        { "number": 3, "title": "The Power of Purpose", "summary": "Finding your main definite purpose and focusing all your energy on achieving it." },
        { "number": 4, "title": "The Secret of Success", "summary": "Developing the character traits and self-discipline of peak performers." }
      ],
      "quotes": [
        "Your life only gets better when you get better.",
        "Success is goals, and all else is commentary.",
        "You are what you think you are."
      ],
      "actionItems": [
        "Write down your 10 most important goals for the next year in the present tense.",
        "Identify one limiting belief you currently have and create a positive affirmation to counter it.",
        "Apply 'Zero-Based Thinking' to one major commitment in your life today.",
        "Spend 10 minutes every morning visualizing your ideal future in vivid detail."
      ]
    },
    "de": {
      "summary": "In 'Andere das Denken, ändere das Leben' vermittelt Brian Tracy das Prinzip der mentalen Programmierung. Er zeigt, wie man negative Glaubenssätze durch Erfolg versprechende Gedanken ersetzt und so seine äußere Realität transformiert. Das Buch bietet Techniken zur Zielsetzung, Visualisierung und Entwicklung von Selbstvertrauen. Es ist ein pragmatischer Leitfaden, um die volle Verantwortung für das eigene Schicksal zu übernehmen und Spitzenleistungen zu erzielen.\n\n### Warum es wichtig ist\nDas Buch betont, dass Erfolg kein Zufall ist, sondern die Folge von mentaler Disziplin. Es hilft den Lesern, aus der Opferrolle auszusteigen und ein proaktives Leben zu führen. Tracys System zur Umprogrammierung des Unterbewusstseins ist einfach anwendbar und bietet sofortige Ergebnisse für das Selbstwertgefühl und die Produktivität.\n\n### Die zentrale Erkenntnis\nDein Leben wird nur besser, wenn du besser wirst. Indem du die volle Kontrolle über deine Gedanken übernimmst, übernimmst du die Kontrolle über deine Ergebnisse. Erfolg beginnt im Kopf durch klare Ziele und unerschütterlichen Glauben.",
      "keyInsights": [
        { "title": "Das Gesetz der Entsprechung", "explanation": "Deine Außenwelt entspricht immer deinem inneren Geisteszustand.", "impact": "Fördert die Eigenverantwortung." },
        { "title": "Zielgerichtetes Denken", "explanation": "Erfolg besteht aus Zielen, der Rest ist nur Kommentierung.", "example": "Tägliches Aufschreiben der wichtigsten Ziele.", "impact": "Erhöht den Fokus und die Umsetzungsgeschwindigkeit." }
      ],
      "chapters": [
        { "number": 1, "title": "Mentale Kontrolle", "summary": "Wie man die Macht der Gedanken nutzt, um Hindernisse zu überwinden." },
        { "number": 2, "title": "Zielsetzung", "summary": "Die Technik der schriftlichen Ziele als Motor des Erfolgs." },
        { "number": 3, "title": "Selbstdisziplin", "summary": "Der Schlüssel zur langfristigen Veränderung und Charakterbildung." }
      ],
      "quotes": [
        "Dein Leben wird erst besser, wenn du besser wirst.",
        "Erfolg ist das Erreichen von Zielen."
      ],
      "actionItems": [
        "Schreiben Sie heute Ihre 10 wichtigsten Ziele auf.",
        "Identifizieren Sie einen negativen Gedanken und ersetzen Sie ihn durch eine positive Affirmation."
      ]
    }
  },
  "The Psychology of Selling": {
    "en": {
      "summary": "Brian Tracy's *The Psychology of Selling* is a field-tested manual for sales professionals that focuses on the mental and emotional aspects of the sales process. Tracy argues that success in sales is 80% mental and 20% technical. By understanding the psychology of both the salesperson and the prospect, you can overcome the fear of rejection, build rapport more effectively, and close more deals. The book covers everything from self-concept and goal setting to prospecting, presenting, and handling objections with a focus on delivering value and solving problems for the customer.\n\n### Why It Matters\nThis book is significant for its shift from 'hard-selling' tactics to a 'consultative' and psychological approach. It matters because it provides practical techniques for building a strong internal dialogue and a high degree of self-confidence—the two most important traits for a successful salesperson. For readers, Tracy’s emphasis on continuous learning and the 'Law of Cause and Effect' in business is highly motivating. It highlights the importance of empathy and active listening as tools for understanding a customer's true needs. It's a foundational text for anyone in sales or business development.\n\n### The Final Takeaway\nSales is a profession of helping. Success is the result of consistently doing the right things, in the right way, with a positive mental attitude. By mastering your own mind and understanding the human needs of your prospects, you can achieve any level of success you desire. Focus on adding value, not just making a sale. You are an expert consultant to your clients.",
      "keyInsights": [
        { "title": "Self-Concept as the Core of Success", "explanation": "Your outer sales performance will always reflect your inner self-concept. If you believe you are a top salesperson, you will act like one and eventually become one. Success begins with the 'mental rehearsal' of an expert.", "example": "Building a strong 'I like myself' and 'I am a professional' internal script.", "impact": "Eliminates the fear of rejection." },
        { "title": "The Customer's Emotional Buying Motives", "explanation": "People buy for emotional reasons and then justify their decisions with logic. To be successful, you must identify the 'hot button'—the primary fear or desire—that is driving the prospect's interest.", "example": "Understanding that a client isn't just buying insurance, but 'peace of mind' and 'family security'.", "impact": "Improves conversion rates and rapport." },
        { "title": "Consultative Selling", "explanation": "Stop being a 'peddler' and start being a professional consultant. Your goal is to help the customer solve a problem or achieve a goal. If you don't provide value, you shouldn't be in the room.", "example": "Asking deep questions to understand the client's business challenges before presenting your product.", "impact": "Builds long-term trust and repeats business." }
      ],
      "chapters": [
        { "number": 1, "title": "The Inner Game of Selling", "summary": "Developing the mindset and self-confidence of a top-performing sales professional." },
        { "number": 2, "title": "Why People Buy", "summary": "Understanding the core emotional needs and fears that drive purchasing decisions." },
        { "number": 3, "title": "The Sales Process", "summary": "Mastering the steps from prospecting and rapport-building to the final close." },
        { "number": 4, "title": "The Ten Keys to Success", "summary": "Integrating the habits and disciplines that ensure long-term excellence in sales." }
      ],
      "quotes": [
        "Your self-concept is the key to your sales performance.",
        "People don't care how much you know until they know how much you care.",
        "Everything counts. Every single detail of your presentation and personality affects the sale."
      ],
      "actionItems": [
        "Record yourself making a sales pitch and identify three areas where you can project more confidence or empathy.",
        "Identify the 'Hot Button' for your three most important prospects this week.",
        "Acknowledge one objection you frequently face and prepare a positive, value-based response.",
        "Make 10 more calls or connections today than you originally planned to build your 'sales muscle'."
      ]
    },
    "de": {
      "summary": "In 'Psychologie des Verkaufens' zeigt Brian Tracy, dass Erfolg im Vertrieb zu 80 % eine Frage der Einstellung und nur zu 20 % Technik ist. Er vermittelt, wie Verkäufer ihre Angst vor Ablehnung überwinden, echtes Vertrauen zum Kunden aufbauen und durch psychologisches Geschick mehr Abschlüsse erzielen. Das Buch betont die Bedeutung von Empathie und den Wandel vom 'Drücker' zum beratenden Experten, der echte Probleme beim Kunden löst.\n\n### Warum es wichtig ist\nDas Buch macht deutlich, dass Verkaufen eine Dienstleistung am Kunden ist. Es bietet wertvolle Werkzeuge zur Stärkung des Selbstwertgefühls und zur Verbesserung der Kommunikation. Es lehrt, die emotionalen Kaufmotive der Kunden zu erkennen und den Verkaufsprozess als partnerschaftliche Lösungssuche zu gestalten. Es ist ein Standardwerk für jeden, der beruflich mit Menschen und Überzeugung zu tun hat.\n\n### Die zentrale Erkenntnis\nVerkaufen bedeutet helfen. Durch die Meisterschaft über das eigene Denken und das Verständnis für die Bedürfnisse des Gegenübers wird Erfolg im Vertrieb planbar und nachhaltig. Ein Spitzenverkäufer ist ein hochgeschätzter Berater für seine Kunden.",
      "keyInsights": [
        { "title": "Selbstbild als Erfolgsfaktor", "explanation": "Ihre Leistung im Außen wird nie Ihr Selbstbild im Innen übersteigen. Glauben Sie an Ihre Professionalität.", "impact": "Stärkt das Selbstvertrauen." },
        { "title": "Emotionale Kaufmotive", "explanation": "Menschen kaufen aus emotionalen Gründen und rechtfertigen dies rational. Identifizieren Sie den 'Hot Button' des Kunden.", "impact": "Erhöht die Abschlussquote." }
      ],
      "chapters": [
        { "number": 1, "title": "Das innere Spiel", "summary": "Die mentale Vorbereitung auf Verkaufserfolge." },
        { "number": 2, "title": "Bedarfsanalyse", "summary": "Den Kunden verstehen und echten Mehrwert bieten." },
        { "number": 3, "title": "Abschlusstechniken", "summary": "Den Verkaufsprozess souverän zum Ziel führen." }
      ],
      "quotes": [
        "Menschen interessiert nicht, wie viel du weißt, bis sie wissen, wie sehr du dich für sie interessierst.",
        "Dein Selbstbild ist der Schlüssel zu deiner Leistung."
      ],
      "actionItems": [
        "Bereiten Sie sich auf das nächste Verkaufsgespräch vor, indem Sie Ihren Mehrwert für den Kunden klar definieren.",
        "Üben Sie sich im aktiven Zuhören, um die wahren Bedürfnisse Ihres Gegenübers zu erfahren."
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 7 (STRAGGLERS) ---');
  
  for (const [title, langs] of Object.entries(EXPANSIONS)) {
    for (const [lang, data] of Object.entries(langs as any)) {
      const d = data as any;
      const books = await prisma.book.findMany({
        where: { 
          OR: [
            { title, language: lang },
            { originalTitle: title, language: lang }
          ]
        }
      });

      for (const book of books) {
        console.log(`Updating "${book.title}" [${lang}] (ID: ${book.id})...`);
        await prisma.book.update({
          where: { id: book.id },
          data: {
            summary: d.summary,
            keyInsights: d.keyInsights,
            chapters: d.chapters,
            quotes: d.quotes,
            actionItems: d.actionItems
          }
        });
        console.log(`   ✅ Success!`);
      }
    }
  }
}

injectExpansions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
