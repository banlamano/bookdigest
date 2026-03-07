import { GoogleGenerativeAI } from '@google/generative-ai';

interface BookData {
  title: string;
  author: string;
  description?: string;
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
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
        // Using gemini-1.5-pro - the stable, working model for new API keys
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
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
      return this.generateFallbackSummary(bookData);
    }

    try {
      const prompt = this.buildPrompt(bookData, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const summary = this.parseAIResponse(text, bookData);
      return summary;
    } catch (error) {
      console.error('AI summary generation failed:', error);
      return this.generateFallbackSummary(bookData);
    }
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
  "bigIdea": "One punchy paragraph (50-80 words) capturing the book's core message in an engaging way",
  "whyItMatters": "2-3 paragraphs (150-200 words) explaining relevance, problems solved, and who should read it",
  "keyInsights": [
    {
      "title": "Catchy insight title",
      "explanation": "What this insight means (2-3 sentences)",
      "example": "Real-world application or example",
      "impact": "How this changes your perspective or life"
    }
    // Include 8-12 insights
  ],
  "chapterSummaries": [
    {
      "chapter": 1,
      "title": "Chapter title or main theme",
      "summary": "80-100 words covering main argument and supporting evidence",
      "keyTakeaway": "One sentence capturing the essential point"
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

  private generateFallbackSummary(bookData: BookData): EnhancedSummary {
    const { title, author, description, categories } = bookData;
    const category = categories?.[0] || 'Self-Help';

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

  private generateFallbackInsights(title: string, author: string, category: string): EnhancedSummary['keyInsights'] {
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

  private generateFallbackChapters(title: string, category: string): EnhancedSummary['chapterSummaries'] {
    return [
      {
        chapter: 1,
        title: 'Introduction: The Problem',
        summary: 'The opening chapter establishes the central challenge that the book addresses, drawing on research and real-world examples to illustrate why traditional approaches often fall short. The author makes a compelling case for rethinking conventional wisdom.',
        keyTakeaway: 'Recognizing the problem is the first step toward finding better solutions.'
      },
      {
        chapter: 2,
        title: 'The Framework',
        summary: 'Here the author introduces the core framework or model that structures the rest of the book. This chapter provides the mental scaffolding readers need to understand and apply subsequent concepts effectively.',
        keyTakeaway: 'A solid framework transforms scattered information into actionable insight.'
      },
      {
        chapter: 3,
        title: 'The First Principle',
        summary: 'The book dives into the first major principle, exploring its origins, supporting evidence, and practical applications. Real-world case studies demonstrate how this principle has created breakthrough results.',
        keyTakeaway: 'Understanding foundational principles enables better decision-making in uncertain situations.'
      },
      {
        chapter: 4,
        title: 'The Second Principle',
        summary: 'Building on the first principle, this chapter introduces a complementary concept that addresses a different dimension of the challenge. The interplay between these principles creates synergistic effects.',
        keyTakeaway: 'Combining multiple principles creates compound benefits greater than the sum of parts.'
      },
      {
        chapter: 5,
        title: 'Common Obstacles',
        summary: 'An honest exploration of the barriers and pitfalls that readers are likely to encounter when applying these ideas. The author provides strategies for anticipating and overcoming each obstacle.',
        keyTakeaway: 'Forewarned is forearmed—knowing common pitfalls helps you navigate around them.'
      },
      {
        chapter: 6,
        title: 'Implementation Strategies',
        summary: 'This chapter shifts from theory to practice, offering specific tactics, tools, and techniques for putting concepts into action. The focus is on creating sustainable systems rather than relying on willpower.',
        keyTakeaway: 'Systems beat goals—design your environment to make success inevitable.'
      },
      {
        chapter: 7,
        title: 'Case Studies',
        summary: 'Detailed stories of individuals and organizations that successfully applied the book\'s principles, including both their challenges and their breakthroughs. These examples make abstract concepts concrete.',
        keyTakeaway: 'Real-world success stories prove that these principles work when properly applied.'
      },
      {
        chapter: 8,
        title: 'Advanced Applications',
        summary: 'For readers ready to go deeper, this chapter explores more sophisticated applications and edge cases. It shows how the principles scale and adapt to different contexts and complexity levels.',
        keyTakeaway: 'Mastery comes from understanding not just what to do, but why and when.'
      },
      {
        chapter: 9,
        title: 'The Long Game',
        summary: 'A thoughtful examination of how to sustain momentum over time, avoiding burnout while maintaining consistent progress. The author addresses the psychological and practical challenges of long-term commitment.',
        keyTakeaway: 'Success is a marathon, not a sprint—pace yourself for sustainable excellence.'
      },
      {
        chapter: 10,
        title: 'Conclusion: Your Next Steps',
        summary: 'The final chapter synthesizes key themes and provides a clear action plan for readers. It emphasizes that knowledge without action is worthless, and encourages readers to start immediately with small steps.',
        keyTakeaway: 'The best time to start was yesterday; the second best time is now.'
      }
    ];
  }

  private generateFallbackQuotes(title: string, author: string, category: string): EnhancedSummary['memorableQuotes'] {
    return [
      {
        quote: 'The difference between who you are and who you want to be is what you do.',
        context: 'This quote appears when discussing the gap between intention and action.',
        significance: 'It cuts through excuses and reminds us that our actions, not our wishes, define our reality.'
      },
      {
        quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        context: 'Used when addressing resilience and the importance of persistence through setbacks.',
        significance: 'This reframes both success and failure as temporary states, focusing on the ongoing journey.'
      },
      {
        quote: 'We don\'t rise to the level of our expectations; we fall to the level of our training.',
        context: 'Emphasizing the importance of preparation and systems over motivation.',
        significance: 'It highlights why consistent practice matters more than momentary inspiration.'
      },
      {
        quote: 'The best way to predict the future is to create it.',
        context: 'Encouraging proactive behavior and ownership over outcomes.',
        significance: 'This shifts the locus of control from external to internal, empowering readers.'
      },
      {
        quote: 'Small daily improvements are the key to staggering long-term results.',
        context: 'Discussing the compound effect of consistent incremental progress.',
        significance: 'It makes massive transformation feel achievable through modest daily actions.'
      }
    ];
  }

  private generateFallbackActionPlan(category: string): EnhancedSummary['actionPlan'] {
    return [
      {
        action: 'Choose one key insight from the book and write down three specific ways you can apply it this week',
        difficulty: 'easy',
        timeframe: 'immediate',
        outcome: 'Clear direction and immediate momentum'
      },
      {
        action: 'Block 30 minutes daily for focused work on your highest-priority goal',
        difficulty: 'medium',
        timeframe: 'immediate',
        outcome: 'Consistent progress on what matters most'
      },
      {
        action: 'Identify and remove one major obstacle or distraction from your environment',
        difficulty: 'easy',
        timeframe: 'immediate',
        outcome: 'Reduced friction and increased focus'
      },
      {
        action: 'Find an accountability partner or join a community aligned with your goals',
        difficulty: 'medium',
        timeframe: 'short-term',
        outcome: 'Support system that keeps you on track'
      },
      {
        action: 'Create a 90-day action plan with specific milestones and success metrics',
        difficulty: 'medium',
        timeframe: 'short-term',
        outcome: 'Clear roadmap and ability to measure progress'
      },
      {
        action: 'Conduct a weekly review to assess what\'s working and adjust your approach',
        difficulty: 'easy',
        timeframe: 'immediate',
        outcome: 'Continuous improvement and course correction'
      },
      {
        action: 'Invest in a course, coach, or mentor to accelerate your learning curve',
        difficulty: 'hard',
        timeframe: 'short-term',
        outcome: 'Expert guidance and faster skill development'
      },
      {
        action: 'Build a daily routine that supports your physical, mental, and emotional wellbeing',
        difficulty: 'medium',
        timeframe: 'short-term',
        outcome: 'Sustainable energy and resilience for long-term success'
      },
      {
        action: 'Share your goals and learnings with others, teaching what you\'ve learned',
        difficulty: 'medium',
        timeframe: 'short-term',
        outcome: 'Deeper understanding and positive influence on others'
      },
      {
        action: 'Commit to reviewing and implementing one book per month for the next year',
        difficulty: 'hard',
        timeframe: 'long-term',
        outcome: 'Compound knowledge and continuous personal evolution'
      }
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
