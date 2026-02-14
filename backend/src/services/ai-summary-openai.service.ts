import OpenAI from 'openai';

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

export class AISummaryServiceOpenAI {
  private openai: OpenAI | null = null;
  private initialized: boolean = false;

  private initialize() {
    if (this.initialized) return;
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        this.openai = new OpenAI({ apiKey });
        console.log('✅ OpenAI initialized successfully');
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error);
      }
    } else {
      console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
    }
    this.initialized = true;
  }

  isAvailable(): boolean {
    this.initialize();
    return this.openai !== null;
  }

  async generateEnhancedSummary(
    bookData: BookData,
    options?: { useGPT4?: boolean }
  ): Promise<EnhancedSummary> {
    this.initialize();
    
    if (!this.isAvailable()) {
      throw new Error('OpenAI not available - check OPENAI_API_KEY');
    }

    try {
      const prompt = this.buildPrompt(bookData);
      
      // Use GPT-4 for premium quality if requested (10x cost but better quality/length)
      const model = options?.useGPT4 ? 'gpt-4o' : 'gpt-4o-mini';
      console.log(`   Using model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert book summarizer for a premium book summary service like Blinkist or Shortform. You always return valid, comprehensive JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 6000, // Increased to allow for deeper, longer summaries (2500-3500 words)
        response_format: { type: 'json_object' }
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) {
        throw new Error('No response from OpenAI');
      }

      const summary = JSON.parse(text);
      
      if (!this.validateSummary(summary)) {
        throw new Error('Invalid summary structure from OpenAI');
      }

      console.log(`✅ Generated summary for "${bookData.title}" using OpenAI GPT-4o-mini`);
      return summary;
    } catch (error) {
      console.error('OpenAI summary generation failed:', error);
      throw error;
    }
  }

  private buildPrompt(bookData: BookData): string {
    const { title, author, description, categories, pageCount } = bookData;

    return `You are an expert book summarizer for a premium book summary service like Blinkist or Shortform. 
Generate a comprehensive, engaging summary for the following book:

Title: ${title}
Author: ${author}
Categories: ${categories?.join(', ') || 'General'}
${description ? `Description: ${description}` : ''}
${pageCount ? `Pages: ${pageCount}` : ''}

Create a JSON response with the following structure (MUST be valid JSON):

{
  "bigIdea": "One punchy paragraph (80-120 words) capturing the book's core message in an engaging way. Make it compelling and specific to this book.",
  "whyItMatters": "3-4 paragraphs (250-350 words) explaining: why this book matters now, what problems it solves, real-world relevance, and who should read it. Be specific and compelling.",
  "keyInsights": [
    {
      "title": "Catchy, specific insight title",
      "explanation": "What this insight means (3-5 sentences). Be detailed and specific to this book, not generic.",
      "example": "Concrete real-world application or example from the book (2-3 sentences)",
      "impact": "How this changes your perspective, behavior, or life (2-3 sentences)"
    }
    // Include 12-15 insights (comprehensive coverage of the book's main ideas)
  ],
  "chapterSummaries": [
    {
      "chapter": 1,
      "title": "Chapter title or main theme",
      "summary": "150-250 words covering: main argument, key supporting evidence, examples, counterarguments addressed, and how it builds on previous chapters. Make it detailed and specific.",
      "keyTakeaway": "One powerful sentence capturing the essential point"
    }
    // Include 10-15 chapters (aim for comprehensive coverage)
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

⚠️ CRITICAL LENGTH REQUIREMENTS (you MUST meet these minimums):
- MINIMUM total output: 2800 words (aim for 3000-3500)
- Each chapter summary: MINIMUM 200 words (aim for 250-300)
- Each insight: MINIMUM 80 words total (explanation + example + impact)
- Include at least 12 chapters and 15 insights

If you generate less than the minimums, the output will be rejected.
This is a 15-20 minute read like Blinkist - be thorough and detailed.

Make the content:
- Engaging and conversational (like Blinkist)
- Specific to this book (not generic platitudes)
- Actionable and practical
- Inspiring and thought-provoking
- Professional yet accessible
- DETAILED enough to justify a 15-20 minute read

Return ONLY the JSON object, no additional text.`;
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

export const aiSummaryService = new AISummaryServiceOpenAI();
