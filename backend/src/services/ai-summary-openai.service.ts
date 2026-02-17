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
      const retryPrompt = this.buildPrompt(bookData, { retry: true });
      
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
        max_tokens: 7500, // Allow longer chapter/insight bodies (aim ~2200-3000 words total)
        response_format: { type: 'json_object' }
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON with error recovery for malformed responses
      let summary: any;
      try {
        summary = JSON.parse(text);
      } catch (parseError) {
        console.log('   ⚠️ JSON parse error, attempting to fix...');
        // Common issue: OpenAI includes markdown blocks or has trailing commas
        try {
          const cleaned = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .trim();
          summary = JSON.parse(cleaned);
          console.log('   ✅ Fixed malformed JSON');
        } catch (secondError) {
          console.error('   ❌ Could not fix JSON. Response length:', text.length);
          console.error('   Error:', parseError instanceof Error ? parseError.message : 'Unknown');
          throw new Error(`JSON parse failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }
      
      if (!this.validateSummary(summary)) {
        // One retry with stricter length/structure instructions (common failure mode: too-short chapters/insights)
        console.warn('⚠️ Summary did not meet quality thresholds (likely too short). Retrying once with stricter prompt...');

        const retryCompletion = await this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert book summarizer for a premium book summary service like Blinkist or Shortform. You always return valid, comprehensive JSON responses.'
            },
            {
              role: 'user',
              content: retryPrompt
            }
          ],
          temperature: 0.6,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        });

        const retryText = retryCompletion.choices[0]?.message?.content;
        if (!retryText) {
          throw new Error('No response from OpenAI (retry)');
        }

        let retrySummary: any;
        try {
          retrySummary = JSON.parse(retryText);
        } catch {
          const cleaned = retryText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/,(\s*[}\]])/g, '$1')
            .trim();
          retrySummary = JSON.parse(cleaned);
        }

        if (!this.validateSummary(retrySummary)) {
          throw new Error('Invalid summary structure/length from OpenAI after retry');
        }

        console.log(`✅ Generated summary for "${bookData.title}" using OpenAI (retry succeeded)`);
        return retrySummary;
      }

      console.log(`✅ Generated summary for "${bookData.title}" using OpenAI GPT-4o-mini`);
      return summary;
    } catch (error) {
      console.error('OpenAI summary generation failed:', error);
      throw error;
    }
  }

  private buildPrompt(bookData: BookData, options?: { retry?: boolean }): string {
    const { title, author, description, categories, pageCount } = bookData;
    const retryNote = options?.retry
      ? '\n\nIMPORTANT: Your previous response was rejected because chapters/insights were too short. Fix this by writing LONGER chapter summaries (at least 180 words each) and substantial insight explanations (55+ words each). Do not increase chapter count; increase depth.'
      : '';

    return `You are an expert book summarizer for a premium book summary service like Blinkist or Shortform.
Generate a comprehensive, engaging summary for the following book:${retryNote}

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
    // Include 8-12 insights (fewer, but deeper and more practical)
  ],
  "chapterSummaries": [
    {
      "chapter": 1,
      "title": "Chapter title or main theme",
      "summary": "250-400 words. Must include: (1) the chapter's key idea, (2) supporting reasoning, (3) a concrete example or mini-story, (4) practical application steps. Write with depth—this should feel premium, not like a short paragraph.",
      "keyTakeaway": "One powerful sentence capturing the essential point"
    }
    // Include 6-8 chapters (max 10). Fewer chapters, but each must be long and substantial.
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

⚠️ IMPORTANT LENGTH TARGETS (aim for these, but keep JSON valid):
- Target total output: 2200-3000 words (15-20 minute read is fine)
- Chapters: 6-8 (max 10), each chapter summary 250-400 words (long, structured, premium)
- Insights: 8-12, each insight explanation 60-120 words (plus example + impact)
- Prefer DEPTH per chapter/insight over adding more items

Be thorough and detailed, but ensure the JSON output is complete and valid.
Quality over quantity - better to have a complete 2000-word summary than a broken 3000-word one.

Make the content:
- Engaging and conversational (like Blinkist)
- Specific to this book (not generic platitudes)
- Actionable and practical
- Inspiring and thought-provoking
- Professional yet accessible
- DETAILED enough to justify a 15-20 minute read

Return ONLY the JSON object, no additional text.`;
  }

  private countWords(text: string): number {
    return (text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;
  }

  private validateSummary(summary: any): boolean {
    // Structural validation
    if (!(
      summary &&
      typeof summary.bigIdea === 'string' &&
      typeof summary.whyItMatters === 'string' &&
      Array.isArray(summary.keyInsights) &&
      Array.isArray(summary.chapterSummaries) &&
      Array.isArray(summary.memorableQuotes) &&
      Array.isArray(summary.actionPlan) &&
      Array.isArray(summary.targetAudience) &&
      typeof summary.finalTakeaway === 'string'
    )) {
      return false;
    }

    // Shape validation (fixes the real feedback: chapters/insights too short)
    // Target: 6-8 chapters, 8-12 insights, but *substantial* bodies.
    const chaptersOk = summary.chapterSummaries.length >= 6 && summary.chapterSummaries.length <= 10;
    const insightsOk = summary.keyInsights.length >= 8 && summary.keyInsights.length <= 14;
    if (!chaptersOk || !insightsOk) return false;

    const chapterTooShort = summary.chapterSummaries.some((ch: any) => {
      const wordCount = this.countWords(ch.summary);
      const tooShort = typeof ch?.summary !== 'string' || wordCount < 180;
      if (tooShort) {
        console.log(`   📊 Chapter "${ch?.title || 'untitled'}" word count: ${wordCount} (min: 180)`);
      }
      return tooShort;
    });
    if (chapterTooShort) return false;

    const insightTooShort = summary.keyInsights.some((ins: any) => {
      const wordCount = this.countWords(ins.explanation);
      const tooShort = typeof ins?.explanation !== 'string' || wordCount < 55;
      if (tooShort) {
        console.log(`   📊 Insight "${ins?.title || 'untitled'}" explanation word count: ${wordCount} (min: 55)`);
      }
      return tooShort;
    });
    if (insightTooShort) return false;

    // Total word sanity check (whole page should not feel "thin")
    const totalWords =
      this.countWords(summary.bigIdea) +
      this.countWords(summary.whyItMatters) +
      this.countWords(summary.finalTakeaway) +
      summary.chapterSummaries.reduce((acc: number, ch: any) => acc + this.countWords(ch.summary) + this.countWords(ch.keyTakeaway || ''), 0) +
      summary.keyInsights.reduce((acc: number, ins: any) => acc + this.countWords(ins.title || '') + this.countWords(ins.explanation || '') + this.countWords(ins.example || '') + this.countWords(ins.impact || ''), 0) +
      summary.actionPlan.reduce((acc: number, a: any) => acc + this.countWords(a.action || '') + this.countWords(a.outcome || ''), 0) +
      summary.memorableQuotes.reduce((acc: number, q: any) => acc + this.countWords(q.quote || '') + this.countWords(q.context || '') + this.countWords(q.significance || ''), 0);

    const meetsMinimum = totalWords >= 1600;
    if (!meetsMinimum) {
      console.log(`   📊 Total word count: ${totalWords} (min: 1600)`);
    }
    return meetsMinimum;
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
