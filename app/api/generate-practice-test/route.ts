import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { sourceContent, settings } = await request.json();

    if (!sourceContent || !settings) {
      return new Response(JSON.stringify({ error: 'Source content and settings are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { questionCount, questionTypes } = settings;

    // Build content summary for the AI
    let contentSummary = '';
    let isFromPrompt = false;

    // Check if generating from a prompt
    if (sourceContent.prompt && typeof sourceContent.prompt === 'string') {
      contentSummary = sourceContent.prompt;
      isFromPrompt = true;
    } else {
      // From existing materials
      if (sourceContent.flashcardSets?.length > 0) {
        for (const set of sourceContent.flashcardSets) {
          contentSummary += '\n\nFlashcard Set Content:\n';
          for (const card of set.cards) {
            contentSummary += `- ${card.front}: ${card.back}\n`;
          }
        }
      }

      if (sourceContent.studyGuides?.length > 0) {
        for (const guide of sourceContent.studyGuides) {
          contentSummary += '\n\nStudy Guide Content:\n';
          if (guide.outline?.sections) {
            for (const section of guide.outline.sections) {
              contentSummary += `\nSection: ${section.title}\n${section.content}\n`;
              if (section.subsections) {
                for (const sub of section.subsections) {
                  contentSummary += `  - ${sub.title}: ${sub.content}\n`;
                }
              }
            }
          }
          if (guide.quickReference) {
            contentSummary += '\nKey Terms:\n';
            for (const term of guide.quickReference.keyTerms || []) {
              contentSummary += `- ${term.term}: ${term.definition}\n`;
            }
          }
        }
      }
    }

    const includesMCQ = questionTypes.includes('mcq');
    const includesFRQ = questionTypes.includes('frq');

    let mcqCount = 0;
    let frqCount = 0;

    if (includesMCQ && includesFRQ) {
      mcqCount = Math.floor(questionCount * 0.7);
      frqCount = questionCount - mcqCount;
    } else if (includesMCQ) {
      mcqCount = questionCount;
    } else if (includesFRQ) {
      frqCount = questionCount;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert AP exam question writer specializing in AP Computer Science A. Generate practice test questions based on the provided study material.

Create exactly ${questionCount} questions total:
${mcqCount > 0 ? `- ${mcqCount} Multiple Choice Questions (MCQ)` : ''}
${frqCount > 0 ? `- ${frqCount} Free Response Questions (FRQ)` : ''}

Rules for MCQ:
- Exactly 4 answer choices (A, B, C, D)
- One correct answer
- Make distractors plausible but clearly incorrect
- Vary difficulty (mix of easy, medium, hard)

Rules for FRQ:
- Require written or code responses
- Include a rubric with 3-5 grading criteria
- Provide a sample answer
- Focus on problem-solving and application

For all questions:
- Be relevant to AP Computer Science A curriculum
- Include clear, detailed explanations
- Assign difficulty levels appropriately

Respond ONLY with valid JSON in this exact format:
{
  "title": "Practice Test Title",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text here?",
      "choices": [
        { "index": 0, "text": "Answer choice A" },
        { "index": 1, "text": "Answer choice B" },
        { "index": 2, "text": "Answer choice C" },
        { "index": 3, "text": "Answer choice D" }
      ],
      "correctAnswerIndex": 0,
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "medium",
      "relatedTopic": "Topic name"
    },
    {
      "id": "q2",
      "type": "frq",
      "question": "FRQ question text with context and requirements...",
      "rubric": [
        { "criterion": "Criterion 1", "points": 2 },
        { "criterion": "Criterion 2", "points": 2 },
        { "criterion": "Criterion 3", "points": 1 }
      ],
      "sampleAnswer": "Example of a correct answer",
      "explanation": "Explanation of the solution approach",
      "difficulty": "hard",
      "relatedTopic": "Topic name"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: isFromPrompt
            ? `Create a practice test about this topic: ${contentSummary}`
            : `Create a practice test based on this study material:\n${contentSummary}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate practice test error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate practice test' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
