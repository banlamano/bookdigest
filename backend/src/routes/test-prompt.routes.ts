import { Router } from 'express';
import { aiSummaryService } from '../services/ai-summary-openai.service';

const router = Router();

// Test endpoint to generate ONE summary and return it (for testing prompts)
router.post('/test-prompt', async (req, res) => {
  const { title, author, description } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      error: 'title and author are required'
    });
  }

  try {
    console.log(`Testing prompt for: ${title} by ${author}`);
    
    const enhanced = await aiSummaryService.generateEnhancedSummary({
      title,
      author,
      description: description || undefined
    });

    const summary = `${enhanced.bigIdea}\n\n${enhanced.whyItMatters}`;
    const summaryWords = summary.split(/\s+/).length;
    
    const chapterWords = enhanced.chapterSummaries.reduce((sum, ch) => 
      sum + ch.summary.split(/\s+/).length, 0);
    
    const insightWords = enhanced.keyInsights.reduce((sum, ins) => 
      sum + ins.explanation.split(/\s+/).length + ins.example.split(/\s+/).length + ins.impact.split(/\s+/).length, 0);
    
    const totalWords = summaryWords + chapterWords + insightWords;

    res.json({
      status: 'success',
      stats: {
        summaryWords,
        chapterWords,
        insightWords,
        totalWords,
        estimatedReadTime: `${Math.round(totalWords / 200)}-${Math.round(totalWords / 180)} min`,
        chapters: enhanced.chapterSummaries.length,
        insights: enhanced.keyInsights.length,
        actionItems: enhanced.actionPlan.length,
        quotes: enhanced.memorableQuotes.length
      },
      data: {
        summary,
        sampleChapter: enhanced.chapterSummaries[0],
        sampleInsight: enhanced.keyInsights[0]
      }
    });

  } catch (error) {
    console.error('Test prompt error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
