import { GoogleGenerativeAI } from '@google/generative-ai';

interface BookData {
  title: string;
  author: string;
  description?: string;
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
  language?: string;
}

interface EnhancedSummary {
  bigIdea: string;
  whyItMatters: string;
  keyInsights: Array<{
    title: string;
    explanation: string;
    example: string;
    impact: string;
  }>;
  chapterSummaries: Array<{
    chapter: number;
    title: string;
    summary: string;
    keyTakeaway: string;
  }>;
  memorableQuotes: Array<{
    quote: string;
    context: string;
    significance: string;
  }>;
  actionPlan: Array<{
    action: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: 'immediate' | 'short-term' | 'long-term';
    outcome: string;
  }>;
  targetAudience: string[];
  finalTakeaway: string;
}

export type SummaryLanguage = 'en' | 'de';

export class AISummaryService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private initialized: boolean = false;

  private initialize() {
    if (this.initialized) return;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // gemini-2.0-flash was retired by Google (404 on generateContent).
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
      }
    }
    this.initialized = true;
  }

  isAvailable(): boolean {
    this.initialize();
    return this.model !== null;
  }

  async generateEnhancedSummary(bookData: BookData, language: SummaryLanguage = 'en'): Promise<EnhancedSummary> {
    this.initialize();
    
    if (!this.isAvailable()) {
      console.log('⚠️ AI not available, using fallback');
      return this.generateFallbackSummary(bookData, language);
    }

    let attempts = 0;
    while (attempts < 5) {
      try {
        console.log(`📝 Generating ${language} summary for: ${bookData.title} (Attempt ${attempts + 1})`);
        const prompt = this.buildPrompt(bookData, language);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        const summary = this.parseAIResponse(text, bookData);
        console.log(`✅ ${language} summary generated for: ${bookData.title}`);
        return summary;
      } catch (error: any) {
        if (error.message?.includes('429')) {
          console.warn(`⏳ Rate limit hit! Waiting 65s...`);
          await new Promise(resolve => setTimeout(resolve, 65000));
          attempts++;
        } else {
          console.error('❌ AI summary generation failed:', error.message);
          return this.generateFallbackSummary(bookData, language);
        }
      }
    }
    console.error('❌ AI summary generation failed after 5 retries (rate limits).');
    return this.generateFallbackSummary(bookData, language);
  }

  private buildPrompt(bookData: BookData, language: SummaryLanguage = 'en'): string {
    const { title, author, description, categories, pageCount } = bookData;
    
    const languageInstructions = language === 'de' 
      ? 'IMPORTANT: Write the entire summary in GERMAN (Deutsch). All content, titles, quotes, and explanations must be in German.'
      : 'Write the summary in English.';

    return `You are an expert book summarizer for a premium book summary service like Blinkist or Shortform. 
${languageInstructions}
Generate a comprehensive, engaging summary for the following book:

Title: ${title}
Author: ${author}
Categories: ${categories?.join(', ') || 'General'}
${description ? `Description: ${description}` : ''}
${pageCount ? `Pages: ${pageCount}` : ''}

Create a JSON response with the following structure (MUST be valid JSON):

{
  "bigIdea": "One punchy paragraph (80-120 words) capturing the book's core message in an engaging way. Make it compelling and specific.",
  "whyItMatters": "3-4 paragraphs (250-350 words) explaining relevance, problems solved, and who should read it. Be very specific and detailed.",
  "keyInsights": [
    {
      "title": "Catchy, specific insight title",
      "explanation": "What this insight means (4-6 sentences). Be detailed and specific to this book, not generic.",
      "example": "Concrete real-world application or example from the book (2-3 sentences)",
      "impact": "How this changes your perspective, behavior, or life (2-3 sentences)"
    }
    // Include 8-12 insights (fewer, but deeper and more practical)
  ],
  "chapterSummaries": [
    {
      "chapter": 1,
      "title": "Chapter title or main theme",
      "summary": "150-250 words covering main argument, supporting evidence, and practical application. Write with depth—this should feel premium.",
      "keyTakeaway": "One powerful sentence capturing the essential point"
    }
    // Include 8-12 chapters
  ],
  "memorableQuotes": [
    {
      "quote": "Actual or representative quote from the book",
      "context": "Where this appears or what situation it addresses",
      "significance": "Why this quote is important or memorable"
    }
    // Include 5-8 quotes
  ],
  "actionPlan": [
    {
      "action": "Specific, actionable step readers can take",
      "difficulty": "easy|medium|hard",
      "timeframe": "immediate|short-term|long-term",
      "outcome": "Expected result or benefit"
    }
    // Include 7-10 actions
  ],
  "targetAudience": [
    "Specific reader persona 1 and what they'll gain",
    "Specific reader persona 2 and what they'll gain",
    "Specific reader persona 3 and what they'll gain"
  ],
  "finalTakeaway": "One powerful paragraph summarizing the lasting impact and the one thing to remember"
}

⚠️ IMPORTANT LENGTH TARGETS:
- Target total output: 2200-3000 words.
- Chapters: 150-250 words each.
- Insights: 80-120 words total per insight.
- Prefer DEPTH per chapter/insight over adding more items.


Make the content:
- Engaging and conversational (like Blinkist)
- Specific to this book (not generic)
- Actionable and practical
- Inspiring and thought-provoking
- Professional yet accessible

Return ONLY the JSON object, no additional text.`;
  }

  private parseAIResponse(text: string, bookData: BookData): EnhancedSummary {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      // Try to extract JSON if there's extra text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      
      // Validate and return
      if (this.validateSummary(parsed)) {
        return parsed;
      } else {
        console.warn('AI response validation failed, using fallback');
        return this.generateFallbackSummary(bookData);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.generateFallbackSummary(bookData);
    }
  }

  private validateSummary(summary: any): boolean {
    return (
      summary &&
      typeof summary.bigIdea === 'string' &&
      typeof summary.whyItMatters === 'string' &&
      Array.isArray(summary.keyInsights) &&
      summary.keyInsights.length >= 5 &&
      Array.isArray(summary.chapterSummaries) &&
      summary.chapterSummaries.length >= 5 &&
      Array.isArray(summary.memorableQuotes) &&
      Array.isArray(summary.actionPlan) &&
      Array.isArray(summary.targetAudience) &&
      typeof summary.finalTakeaway === 'string'
    );
  }

  private generateFallbackSummary(bookData: BookData, language: SummaryLanguage = 'en'): EnhancedSummary {
    const { title, author, description, categories } = bookData;
    const category = categories?.[0] || 'Self-Help';
    
    if (language === 'de') {
      return {
        bigIdea: `"${title}" von ${author} ist ein transformatives Handbuch, das konventionelles Denken herausfordert und umsetzbare Einblicke für ${category.toLowerCase()}-Enthusiasten bietet. Dieses Buch destilliert komplexe Konzepte in praktische Weisheit, die sofort angewendet werden kann, um Ihr Leben zu verbessern und bedeutungsvolle Ergebnisse zu erzielen.`,
        
        whyItMatters: `In der heutigen schnelllebigen Welt adressiert "${title}" kritische Herausforderungen, mit denen viele Menschen konfrontiert sind. ${author} bringt Forschung, persönliche Erfahrung und bewährte Strategien zusammen, um Lesern zu helfen, moderne Komplexitäten zu bewältigen. Ob Sie Ihre ${category.toLowerCase()}-Fähigkeiten verbessern, Hindernisse überwinden oder Durchbruchsergebnisse erzielen möchten - dieses Buch bietet die notwendige Wegbeschreibung.`,
        
        keyInsights: this.generateFallbackInsights(title, author, category, 'de'),
        chapterSummaries: this.generateFallbackChapters(title, category, 'de'),
        memorableQuotes: this.generateFallbackQuotes(title, author, category, 'de'),
        actionPlan: this.generateFallbackActionPlan(category, 'de'),
        targetAudience: [
          `Fachleute, die ihre Karriere im Bereich ${category.toLowerCase()} voranbringen möchten`,
          `Personen, die ihre ${category.toLowerCase()}-Fähigkeiten entwickeln möchten`,
          `Jeder, der an praktischen, evidenzbasierten Ansätzen zur persönlichen Entwicklung interessiert ist`
        ],
        finalTakeaway: `"${title}" erinnert uns daran, dass bedeutungsvolle Veränderung aus dem Verstehen von Grundprinzipien und konsequenter Handlung kommt. Der Schlüssel liegt nicht nur darin, neue Konzepte zu lernen, sondern sie in die tägliche Praxis zu integrieren. Beginnen Sie mit einem Einblick, wenden Sie ihn konsequent an und bauen Sie darauf auf. Ihre Transformation beginnt mit der Entscheidung, den ersten Schritt zu tun.`
      };
    }

    return {
      bigIdea: `"${title}" by ${author} is a transformative guide that challenges conventional thinking and provides actionable insights for ${category.toLowerCase()} enthusiasts. This book distills complex concepts into practical wisdom that can be applied immediately to improve your life and achieve meaningful results.`,
      
      whyItMatters: `In today's fast-paced world, "${title}" addresses critical challenges that many people face. ${author} brings together research, personal experience, and proven strategies to help readers navigate modern complexities. Whether you're looking to enhance your ${category.toLowerCase()} skills, overcome obstacles, or achieve breakthrough results, this book provides the roadmap you need. ${description ? description.substring(0, 200) : 'The insights shared here have helped thousands of readers transform their approach and achieve remarkable outcomes.'}`,
      
      keyInsights: this.generateFallbackInsights(title, author, category),
      chapterSummaries: this.generateFallbackChapters(title, category),
      memorableQuotes: this.generateFallbackQuotes(title, author, category),
      actionPlan: this.generateFallbackActionPlan(category),
      targetAudience: [
        `Professionals seeking to advance their career in ${category.toLowerCase()}`,
        `Individuals looking to develop their ${category.toLowerCase()} skills`,
        `Anyone interested in practical, evidence-based approaches to personal growth`
      ],
      finalTakeaway: `"${title}" reminds us that meaningful change comes from understanding core principles and taking consistent action. The key is not just learning new concepts, but integrating them into daily practice. Start with one insight, apply it consistently, and build from there. Your transformation begins with the decision to take the first step.`
    };
  }

  private generateFallbackInsights(title: string, author: string, category: string, language: SummaryLanguage = 'en'): EnhancedSummary['keyInsights'] {
    if (language === 'de') {
      return [
        {
          title: 'Das Grundprinzip',
          explanation: `${author} etabliert das grundlegende Framework, das allen anderen Konzepten im Buch zugrunde liegt. Dieses Prinzip dient als Grundstein für das Verständnis, wie man ${category.toLowerCase()} effektiv angeht.`,
          example: 'Leser können dies anwenden, indem sie ihre aktuellen Annahmen untersuchen und eine stärkere Grundlage für Wachstum schaffen.',
          impact: 'Dies verändert Ihre Perspektive von reaktiv zu proaktiv und ermöglicht strategischere Entscheidungsfindung.'
        },
        {
          title: 'Die Transformationsmethode',
          explanation: 'Ein systematischer Ansatz zur Implementierung nachhaltiger Veränderung, der komplexe Ziele in überschaubare Schritte zerlegt, die über Zeit Momentum aufbauen.',
          example: 'Beginnen Sie mit kleinen täglichen Gewohnheiten, die mit Ihrer größeren Vision übereinstimmen, und schaffen Sie über Wochen und Monate hinweg Zusammensetzungseffekte.',
          impact: 'Sie gehen von Überforderung durch große Ziele zu Ermächtigung durch kontinuierlichen Fortschritt über.'
        },
        {
          title: 'Der Mindset-Schub',
          explanation: 'Verstehen, wie unsere mentalen Modelle unsere Ergebnisse formen, und lernen, Perspektiven zu kultivieren, die unseren höchsten Zielen dienen.',
          example: 'Wenn Sie auf Hindernisse stoßen, fragen Sie "Was kann ich lernen?" anstatt "Warum passiert mir das?"',
          impact: 'Diese Neubewertung verwandelt Rückschläge in Stufen, beschleunigt Ihre Wachstumsbahn.'
        },
        {
          title: 'Der Verbindungsfaktor',
          explanation: 'Die Bedeutung von Beziehungen und Gemeinschaft für nachhaltigen Erfolg und Erfüllung erkennen.',
          example: 'Bauen Sie bewusst ein Netzwerk von Menschen auf, die Sie inspirieren, fordern und bei Ihrer Entwicklung unterstützen.',
          impact: 'Sie schaffen ein leistungsstarkes Ökosystem, das Ihre Bemühungen verstärkt und neue Möglichkeiten eröffnet.'
        },
        {
          title: 'Die Handlungsorientierung',
          explanation: 'Über Planung und Analyse hinaus zur intelligenten Handlung tendieren, aus Feedback lernen und schnell iterieren.',
          example: 'Anstatt Ihren Plan zu perfektionieren, starten Sie mit Version 1.0 und verbessern Sie basierend auf realen Ergebnissen.',
          impact: 'Sie befreien sich von Paralyse durch Analyse und erzeugen Momentum, das Sie vorwärtsträgt.'
        },
        {
          title: 'Die Prioritätsmatrix',
          explanation: 'Lernen, zwischen dem, was dringend und dem, was wichtig ist, zu unterscheiden und Energie auf Aktivitäten mit hoher Wirkung zu richten.',
          example: 'Planen Sie Zeit für wichtige nicht-dringende Aufgaben, bevor sie zu dringenden Krisen werden.',
          impact: 'Sie gewinnen die Kontrolle über Ihre Zeit zurück und richten sie auf das wirklich Wichtige aus.'
        },
        {
          title: 'Der Resilienzfaktor',
          explanation: 'Mentale und emotionale Stärke aufbauen, um Herausforderungen, Rückschläge und Unsicherheit zu bewahren, ohne Ihr Ziel aus den Augen zu verlieren.',
          example: 'Entwickeln Sie Praktiken wie Tagebuch, Meditation oder körperliche Bewegung, die Ihre Energie und Klarheit wiederherstellen.',
          impact: 'Sie werden antifragil - wachsen stärker durch Widrigkeiten, anstatt unter Druck zu brechen.'
        },
        {
          title: 'Die kontinuierliche Verbesserungsschleife',
          explanation: 'Eine Philosophie des ständigen Lernens und Verfeinerns annehmen, bei der jede Erfahrung zu Optimierungsdaten wird.',
          example: 'Führen Sie wöchentliche Reviews durch, um zu identifizieren, was funktioniert hat, was nicht, und was als Nächstes zu versuchen ist.',
          impact: 'Sie vervielfachen Ihr Wachstum exponentiell anstatt linear und beschleunigen Ergebnisse über Zeit.'
        }
      ];
    }

    const insights = [
      {
        title: 'The Foundation Principle',
        explanation: `${author} establishes the fundamental framework that underpins all other concepts in the book. This principle serves as the cornerstone for understanding how to approach ${category.toLowerCase()} effectively.`,
        example: 'Readers can apply this by examining their current assumptions and building a stronger foundation for growth.',
        impact: 'This shifts your perspective from reactive to proactive, enabling more strategic decision-making.'
      },
      {
        title: 'The Transformation Method',
        explanation: 'A systematic approach to implementing lasting change, breaking down complex goals into manageable steps that build momentum over time.',
        example: 'Start with small daily habits that align with your larger vision, creating compound effects over weeks and months.',
        impact: 'You move from feeling overwhelmed by big goals to feeling empowered by consistent progress.'
      },
      {
        title: 'The Mindset Shift',
        explanation: 'Understanding how our mental models shape our results, and learning to cultivate perspectives that serve our highest goals.',
        example: 'When facing obstacles, ask "What can I learn?" instead of "Why is this happening to me?"',
        impact: 'This reframe turns setbacks into stepping stones, accelerating your growth trajectory.'
      },
      {
        title: 'The Connection Factor',
        explanation: 'Recognizing the importance of relationships and community in achieving sustainable success and fulfillment.',
        example: 'Deliberately build a network of people who inspire, challenge, and support your development.',
        impact: 'You create a powerful ecosystem that amplifies your efforts and opens new possibilities.'
      },
      {
        title: 'The Action Bias',
        explanation: 'Moving beyond planning and analysis to bias toward taking intelligent action, learning from feedback, and iterating quickly.',
        example: 'Instead of perfecting your plan, start with version 1.0 and improve based on real-world results.',
        impact: 'You break free from paralysis by analysis and generate momentum that carries you forward.'
      },
      {
        title: 'The Priority Matrix',
        explanation: 'Learning to distinguish between what is urgent and what is important, focusing energy on high-impact activities.',
        example: 'Schedule time for important non-urgent tasks before they become urgent crises.',
        impact: 'You reclaim control of your time and direct it toward what truly matters.'
      },
      {
        title: 'The Resilience Factor',
        explanation: 'Building mental and emotional strength to navigate challenges, setbacks, and uncertainty without losing sight of your vision.',
        example: 'Develop practices like journaling, meditation, or physical exercise that restore your energy and clarity.',
        impact: 'You become antifragile—growing stronger through adversity rather than breaking under pressure.'
      },
      {
        title: 'The Continuous Improvement Loop',
        explanation: 'Embracing a philosophy of constant learning and refinement, where every experience becomes data for optimization.',
        example: 'Conduct weekly reviews to identify what worked, what didn\'t, and what to try next.',
        impact: 'You compound your growth exponentially rather than linearly, accelerating results over time.'
      }
    ];

    return insights;
  }

  private generateFallbackChapters(title: string, category: string, language: SummaryLanguage = 'en'): EnhancedSummary['chapterSummaries'] {
    if (language === 'de') {
      return [
        { chapter: 1, title: 'Einführung: Das Problem', summary: 'Das Eröffnungskapitel stellt die zentrale Herausforderung vor, die das Buch anspricht, und nutzt Forschung und reale Beispiele, um zu zeigen, warum traditionelle Ansätze oft zu kurz greifen.', keyTakeaway: 'Das Problem zu erkennen ist der erste Schritt zur Lösung.' },
        { chapter: 2, title: 'Das Framework', summary: 'Hier stellt der Autor das Kernmodell vor, das den Rest des Buches strukturiert. Dieses Kapitel bietet das mentale Gerüst, das Leser benötigen.', keyTakeaway: 'Ein solides Framework verwandelt verstreute Informationen in handlungsrelevante Erkenntnisse.' },
        { chapter: 3, title: 'Das erste Prinzip', summary: 'Das Buch taucht in das erste Hauptprinzip ein, erkundet seine Ursprünge, unterstützende Beweise und praktische Anwendungen mit Fallstudien.', keyTakeaway: 'Grundlegende Prinzipien zu verstehen ermöglicht bessere Entscheidungsfindung.' },
        { chapter: 4, title: 'Das zweite Prinzip', summary: 'Aufbauend auf dem ersten Prinzip führt dieses Kapitel ein ergänzendes Konzept ein, das eine andere Dimension der Herausforderung anspricht.', keyTakeaway: 'Die Kombination mehrerer Prinzipien erzeugt Synergieeffekte.' },
        { chapter: 5, title: 'Häufige Hindernisse', summary: 'Eine ehrliche Erkundung der Barrieren und Fallstricke, auf die Leser wahrscheinlich stoßen werden, mit Strategien zur Überwindung.', keyTakeaway: 'Vorgewarnt ist gewappnet – häufige Fallstricke zu kennen hilft, sie zu umgehen.' },
        { chapter: 6, title: 'Umsetzungsstrategien', summary: 'Dieses Kapitel wechselt von Theorie zu Praxis und bietet konkrete Taktiken, Werkzeuge und Techniken für die Umsetzung.', keyTakeaway: 'Systeme schlagen Ziele – gestalten Sie Ihre Umgebung für unvermeidlichen Erfolg.' },
        { chapter: 7, title: 'Fallstudien', summary: 'Detaillierte Geschichten von Einzelpersonen und Organisationen, die die Prinzipien des Buches erfolgreich angewandt haben.', keyTakeaway: 'Erfolgsgeschichten aus der Praxis beweisen, dass diese Prinzipien funktionieren.' },
        { chapter: 8, title: 'Fortgeschrittene Anwendungen', summary: 'Für Leser, die tiefer gehen möchten, erkundet dieses Kapitel anspruchsvollere Anwendungen und Grenzfälle.', keyTakeaway: 'Meisterschaft kommt vom Verständnis nicht nur des Was, sondern auch des Warum und Wann.' },
        { chapter: 9, title: 'Das lange Spiel', summary: 'Eine nachdenkliche Untersuchung, wie man Momentum über Zeit aufrechterhalten kann, während man Burnout vermeidet.', keyTakeaway: 'Erfolg ist ein Marathon, kein Sprint – passen Sie Ihr Tempo für nachhaltige Exzellenz an.' },
        { chapter: 10, title: 'Fazit: Ihre nächsten Schritte', summary: 'Das letzte Kapitel fasst die Hauptthemen zusammen und bietet einen klaren Aktionsplan für Leser.', keyTakeaway: 'Die beste Zeit zu beginnen war gestern; die zweitbeste Zeit ist jetzt.' }
      ];
    }

    return [
      { chapter: 1, title: 'Introduction: The Problem', summary: 'The opening chapter establishes the central challenge that the book addresses, drawing on research and real-world examples to illustrate why traditional approaches often fall short. The author makes a compelling case for rethinking conventional wisdom.', keyTakeaway: 'Recognizing the problem is the first step toward finding better solutions.' },
      { chapter: 2, title: 'The Framework', summary: 'Here the author introduces the core framework or model that structures the rest of the book. This chapter provides the mental scaffolding readers need to understand and apply subsequent concepts effectively.', keyTakeaway: 'A solid framework transforms scattered information into actionable insight.' },
      { chapter: 3, title: 'The First Principle', summary: 'The book dives into the first major principle, exploring its origins, supporting evidence, and practical applications. Real-world case studies demonstrate how this principle has created breakthrough results.', keyTakeaway: 'Understanding foundational principles enables better decision-making in uncertain situations.' },
      { chapter: 4, title: 'The Second Principle', summary: 'Building on the first principle, this chapter introduces a complementary concept that addresses a different dimension of the challenge. The interplay between these principles creates synergistic effects.', keyTakeaway: 'Combining multiple principles creates compound benefits greater than the sum of parts.' },
      { chapter: 5, title: 'Common Obstacles', summary: 'An honest exploration of the barriers and pitfalls that readers are likely to encounter when applying these ideas. The author provides strategies for anticipating and overcoming each obstacle.', keyTakeaway: 'Forewarned is forearmed—knowing common pitfalls helps you navigate around them.' },
      { chapter: 6, title: 'Implementation Strategies', summary: 'This chapter shifts from theory to practice, offering specific tactics, tools, and techniques for putting concepts into action. The focus is on creating sustainable systems rather than relying on willpower.', keyTakeaway: 'Systems beat goals—design your environment to make success inevitable.' },
      { chapter: 7, title: 'Case Studies', summary: 'Detailed stories of individuals and organizations that successfully applied the book\'s principles, including both their challenges and their breakthroughs. These examples make abstract concepts concrete.', keyTakeaway: 'Real-world success stories prove that these principles work when properly applied.' },
      { chapter: 8, title: 'Advanced Applications', summary: 'For readers ready to go deeper, this chapter explores more sophisticated applications and edge cases. It shows how the principles scale and adapt to different contexts and complexity levels.', keyTakeaway: 'Mastery comes from understanding not just what to do, but why and when.' },
      { chapter: 9, title: 'The Long Game', summary: 'A thoughtful examination of how to sustain momentum over time, avoiding burnout while maintaining consistent progress. The author addresses the psychological and practical challenges of long-term commitment.', keyTakeaway: 'Success is a marathon, not a sprint—pace yourself for sustainable excellence.' },
      { chapter: 10, title: 'Conclusion: Your Next Steps', summary: 'The final chapter synthesizes key themes and provides a clear action plan for readers. It emphasizes that knowledge without action is worthless, and encourages readers to start immediately with small steps.', keyTakeaway: 'The best time to start was yesterday; the second best time is now.' }
    ];
  }

  private generateFallbackQuotes(title: string, author: string, category: string, language: SummaryLanguage = 'en'): EnhancedSummary['memorableQuotes'] {
    if (language === 'de') {
      return [
        { quote: 'Der Unterschied zwischen dem, wer Sie sind, und dem, wer Sie sein wollen, ist das, was Sie tun.', context: 'Dieses Zitat erscheint bei der Diskussion über die Kluft zwischen Absicht und Handlung.', significance: 'Es durchbricht Ausreden und erinnert uns daran, dass unsere Handlungen, nicht unsere Wünsche, unsere Realität definieren.' },
        { quote: 'Erfolg ist nicht endgültig, Misserfolg ist nicht fatal: Es ist der Mut weiterzumachen, der zählt.', context: 'Verwendet bei der Diskussion über Resilienz und die Bedeutung von Ausdauer bei Rückschlägen.', significance: 'Dies rahmt sowohl Erfolg als auch Misserfolg als vorübergehende Zustände, mit Fokus auf die kontinuierliche Reise.' },
        { quote: 'Wir steigen nicht auf das Niveau unserer Erwartungen; wir fallen auf das Niveau unseres Trainings.', context: 'Betonung der Bedeutung von Vorbereitung und Systemen gegenüber Motivation.', significance: 'Es zeigt, warum konsequentes Üben wichtiger ist als momentane Inspiration.' },
        { quote: 'Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erschaffen.', context: 'Ermutigung zu proaktivem Verhalten und Eigenverantwortung für Ergebnisse.', significance: 'Dies verschiebt den Kontrollort von extern zu intern und ermächtigt Leser.' },
        { quote: 'Kleine tägliche Verbesserungen sind der Schlüssel zu erstaunlichen langfristigen Ergebnissen.', context: 'Diskussion über den Zinseszinseffekt von konsequentem inkrementellem Fortschritt.', significance: 'Es lässt massive Transformation durch bescheidene tägliche Handlungen erreichbar erscheinen.' }
      ];
    }

    return [
      { quote: 'The difference between who you are and who you want to be is what you do.', context: 'This quote appears when discussing the gap between intention and action.', significance: 'It cuts through excuses and reminds us that our actions, not our wishes, define our reality.' },
      { quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', context: 'Used when addressing resilience and the importance of persistence through setbacks.', significance: 'This reframes both success and failure as temporary states, focusing on the ongoing journey.' },
      { quote: 'We don\'t rise to the level of our expectations; we fall to the level of our training.', context: 'Emphasizing the importance of preparation and systems over motivation.', significance: 'It highlights why consistent practice matters more than momentary inspiration.' },
      { quote: 'The best way to predict the future is to create it.', context: 'Encouraging proactive behavior and ownership over outcomes.', significance: 'This shifts the locus of control from external to internal, empowering readers.' },
      { quote: 'Small daily improvements are the key to staggering long-term results.', context: 'Discussing the compound effect of consistent incremental progress.', significance: 'It makes massive transformation feel achievable through modest daily actions.' }
    ];
  }

  private generateFallbackActionPlan(category: string, language: SummaryLanguage = 'en'): EnhancedSummary['actionPlan'] {
    if (language === 'de') {
      return [
        { action: 'Wählen Sie eine wichtige Erkenntnis aus dem Buch und schreiben Sie drei konkrete Wege auf, wie Sie sie diese Woche anwenden können', difficulty: 'easy', timeframe: 'immediate', outcome: 'Klare Richtung und sofortiges Momentum' },
        { action: 'Blockieren Sie täglich 30 Minuten für fokussierte Arbeit an Ihrem wichtigsten Ziel', difficulty: 'medium', timeframe: 'immediate', outcome: 'Konsequenter Fortschritt bei dem, was am wichtigsten ist' },
        { action: 'Identifizieren und entfernen Sie ein großes Hindernis oder eine Ablenkung aus Ihrer Umgebung', difficulty: 'easy', timeframe: 'immediate', outcome: 'Reduzierte Reibung und erhöhter Fokus' },
        { action: 'Finden Sie einen Accountability-Partner oder schließen Sie sich einer Gemeinschaft an, die mit Ihren Zielen übereinstimmt', difficulty: 'medium', timeframe: 'short-term', outcome: 'Unterstützungssystem, das Sie auf Kurs hält' },
        { action: 'Erstellen Sie einen 90-Tage-Aktionsplan mit konkreten Meilensteinen und Erfolgskennzahlen', difficulty: 'medium', timeframe: 'short-term', outcome: 'Klarer Fahrplan und Fähigkeit, Fortschritt zu messen' },
        { action: 'Führen Sie eine wöchentliche Überprüfung durch, um zu bewerten, was funktioniert und Ihren Ansatz anzupassen', difficulty: 'easy', timeframe: 'immediate', outcome: 'Kontinuierliche Verbesserung und Kurskorrektur' },
        { action: 'Investieren Sie in einen Kurs, Coach oder Mentor, um Ihre Lernkurve zu beschleunigen', difficulty: 'hard', timeframe: 'short-term', outcome: 'Expertenberatung und schnellere Kompetenzentwicklung' },
        { action: 'Bauen Sie eine tägliche Routine auf, die Ihr körperliches, geistiges und emotionales Wohlbefinden unterstützt', difficulty: 'medium', timeframe: 'short-term', outcome: 'Nachhaltige Energie und Resilienz für langfristigen Erfolg' },
        { action: 'Teilen Sie Ihre Ziele und Erkenntnisse mit anderen und lehren Sie, was Sie gelernt haben', difficulty: 'medium', timeframe: 'short-term', outcome: 'Tieferes Verständnis und positiver Einfluss auf andere' },
        { action: 'Verpflichten Sie sich, ein Buch pro Monat für das nächste Jahr zu lesen und umzusetzen', difficulty: 'hard', timeframe: 'long-term', outcome: 'Zusammengesetztes Wissen und kontinuierliche persönliche Evolution' }
      ];
    }

    return [
      { action: 'Choose one key insight from the book and write down three specific ways you can apply it this week', difficulty: 'easy', timeframe: 'immediate', outcome: 'Clear direction and immediate momentum' },
      { action: 'Block 30 minutes daily for focused work on your highest-priority goal', difficulty: 'medium', timeframe: 'immediate', outcome: 'Consistent progress on what matters most' },
      { action: 'Identify and remove one major obstacle or distraction from your environment', difficulty: 'easy', timeframe: 'immediate', outcome: 'Reduced friction and increased focus' },
      { action: 'Find an accountability partner or join a community aligned with your goals', difficulty: 'medium', timeframe: 'short-term', outcome: 'Support system that keeps you on track' },
      { action: 'Create a 90-day action plan with specific milestones and success metrics', difficulty: 'medium', timeframe: 'short-term', outcome: 'Clear roadmap and ability to measure progress' },
      { action: 'Conduct a weekly review to assess what\'s working and adjust your approach', difficulty: 'easy', timeframe: 'immediate', outcome: 'Continuous improvement and course correction' },
      { action: 'Invest in a course, coach, or mentor to accelerate your learning curve', difficulty: 'hard', timeframe: 'short-term', outcome: 'Expert guidance and faster skill development' },
      { action: 'Build a daily routine that supports your physical, mental, and emotional wellbeing', difficulty: 'medium', timeframe: 'short-term', outcome: 'Sustainable energy and resilience for long-term success' },
      { action: 'Share your goals and learnings with others, teaching what you\'ve learned', difficulty: 'medium', timeframe: 'short-term', outcome: 'Deeper understanding and positive influence on others' },
      { action: 'Commit to reviewing and implementing one book per month for the next year', difficulty: 'hard', timeframe: 'long-term', outcome: 'Compound knowledge and continuous personal evolution' }
    ];
  }

  // Generate legacy format for backward compatibility
  async generateLegacySummary(bookData: BookData): Promise<string> {
    const enhanced = await this.generateEnhancedSummary(bookData);
    return `${enhanced.bigIdea}\n\n${enhanced.whyItMatters}`;
  }

  async generateKeyInsights(bookData: BookData, count: number = 10): Promise<Array<{ title: string; description: string }>> {
    const enhanced = await this.generateEnhancedSummary(bookData);
    return enhanced.keyInsights.slice(0, count).map(insight => ({
      title: insight.title,
      description: `${insight.explanation} ${insight.example}`
    }));
  }

  async generateChapters(bookData: BookData): Promise<Array<{ number: number; title: string; summary: string }>> {
    const enhanced = await this.generateEnhancedSummary(bookData);
    return enhanced.chapterSummaries.map(ch => ({
      number: ch.chapter,
      title: ch.title,
      summary: ch.summary
    }));
  }

  async generateQuotes(bookData: BookData, count: number = 5): Promise<string[]> {
    const enhanced = await this.generateEnhancedSummary(bookData);
    return enhanced.memorableQuotes.slice(0, count).map(q => q.quote);
  }

  async generateActionItems(bookData: BookData, count: number = 10): Promise<string[]> {
    const enhanced = await this.generateEnhancedSummary(bookData);
    return enhanced.actionPlan.slice(0, count).map(a => a.action);
  }
}

export const aiSummaryService = new AISummaryService();
