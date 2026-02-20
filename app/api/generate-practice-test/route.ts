import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maximum questions per batch to avoid token limits
const MAX_QUESTIONS_PER_BATCH = 10;

interface Question {
  id: string;
  type: 'mcq' | 'frq';
  question: string;
  choices?: { index: number; text: string }[];
  correctAnswerIndex?: number;
  rubric?: { criterion: string; points: number }[];
  sampleAnswer?: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedTopic: string;
}

interface BatchResult {
  questions: Question[];
}

// Clean and parse JSON from AI response
function parseAIResponse(content: string): BatchResult {
  // Try to extract JSON from the response
  let jsonStr = content.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  // Try to find JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Try to fix common JSON issues
    // Remove trailing commas
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    // Fix unescaped quotes in strings
    jsonStr = jsonStr.replace(/(?<!\\)\\(?!["\\/bfnrt])/g, '\\\\');

    return JSON.parse(jsonStr);
  }
}

async function generateBatch(
  contentSummary: string,
  isFromPrompt: boolean,
  mcqCount: number,
  frqCount: number,
  batchNumber: number,
  existingQuestions: string[],
  difficultyDistribution: { easy: number; medium: number; hard: number }
): Promise<Question[]> {
  const totalInBatch = mcqCount + frqCount;

  const avoidQuestionsPrompt = existingQuestions.length > 0
    ? `\n\nIMPORTANT: Do NOT repeat any of these questions or very similar variations:\n${existingQuestions.slice(-15).map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert AP exam question writer specializing in AP Computer Science A. Generate practice test questions based on the provided study material.

Create exactly ${totalInBatch} questions for this batch:
${mcqCount > 0 ? `- ${mcqCount} Multiple Choice Questions (MCQ)` : ''}
${frqCount > 0 ? `- ${frqCount} Free Response Questions (FRQ)` : ''}

DIFFICULTY DISTRIBUTION (IMPORTANT - follow exactly):
- Easy: ${difficultyDistribution.easy} questions
- Medium: ${difficultyDistribution.medium} questions
- Hard: ${difficultyDistribution.hard} questions

Rules for MCQ:
- Exactly 4 answer choices (A, B, C, D)
- One correct answer
- Make distractors plausible but clearly incorrect
- Include code snippets where appropriate

Rules for FRQ:
- Require written or code responses
- Include a rubric with 3-5 grading criteria
- Provide a sample answer
- Focus on problem-solving and application

For all questions:
- Be relevant to AP Computer Science A curriculum
- Include clear, detailed explanations
- EACH QUESTION MUST BE UNIQUE - no repeated concepts or similar questions
- Use different scenarios, variable names, and contexts for each question
- Number questions starting from q${(batchNumber - 1) * MAX_QUESTIONS_PER_BATCH + 1}
${avoidQuestionsPrompt}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "id": "q${(batchNumber - 1) * MAX_QUESTIONS_PER_BATCH + 1}",
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
      "id": "q${(batchNumber - 1) * MAX_QUESTIONS_PER_BATCH + 2}",
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
          ? `Create unique practice test questions (batch ${batchNumber}) about this topic: ${contentSummary}`
          : `Create unique practice test questions (batch ${batchNumber}) based on this study material:\n${contentSummary}`,
      },
    ],
    temperature: 0.8,
    max_tokens: 8000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed = parseAIResponse(content);

  // Renumber questions to ensure unique IDs
  return parsed.questions.map((q, idx) => ({
    ...q,
    id: `q${(batchNumber - 1) * MAX_QUESTIONS_PER_BATCH + idx + 1}`,
  }));
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { sourceContent, settings } = await request.json();

    if (!sourceContent || !settings) {
      return new Response(JSON.stringify({ error: 'Source content and settings are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { questionCount, questionTypes, mcqRatio } = settings;

    // Build content summary for the AI
    let contentSummary = '';
    let isFromPrompt = false;

    if (sourceContent.prompt && typeof sourceContent.prompt === 'string') {
      contentSummary = sourceContent.prompt;
      isFromPrompt = true;
    } else {
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

    // Calculate total MCQ and FRQ counts
    let totalMCQ = 0;
    let totalFRQ = 0;

    if (includesMCQ && includesFRQ) {
      // Use custom ratio if provided, otherwise 50/50
      const ratio = mcqRatio !== undefined ? mcqRatio : 50;
      totalMCQ = Math.round(questionCount * (ratio / 100));
      totalFRQ = questionCount - totalMCQ;
    } else if (includesMCQ) {
      totalMCQ = questionCount;
    } else if (includesFRQ) {
      totalFRQ = questionCount;
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Calculate number of batches needed
          const totalQuestions = questionCount;
          const numBatches = Math.ceil(totalQuestions / MAX_QUESTIONS_PER_BATCH);

          // Generate questions in batches
          const allQuestions: Question[] = [];
          const existingQuestionTexts: string[] = [];

          for (let batch = 1; batch <= numBatches; batch++) {
            const questionsRemaining = totalQuestions - allQuestions.length;
            const questionsInThisBatch = Math.min(MAX_QUESTIONS_PER_BATCH, questionsRemaining);

            // Send progress update
            sendEvent({
              type: 'progress',
              current: allQuestions.length,
              total: totalQuestions,
              status: `Generating batch ${batch}/${numBatches}...`,
            });

            // Calculate MCQ/FRQ for this batch proportionally
            const mcqRemaining = totalMCQ - allQuestions.filter(q => q.type === 'mcq').length;
            const frqRemaining = totalFRQ - allQuestions.filter(q => q.type === 'frq').length;

            let batchMCQ = 0;
            let batchFRQ = 0;

            if (includesMCQ && includesFRQ) {
              batchMCQ = Math.min(Math.ceil(questionsInThisBatch * (totalMCQ / totalQuestions)), mcqRemaining);
              batchFRQ = Math.min(questionsInThisBatch - batchMCQ, frqRemaining);
              if (batchMCQ + batchFRQ < questionsInThisBatch) {
                if (mcqRemaining > batchMCQ) {
                  batchMCQ = questionsInThisBatch - batchFRQ;
                } else {
                  batchFRQ = questionsInThisBatch - batchMCQ;
                }
              }
            } else if (includesMCQ) {
              batchMCQ = questionsInThisBatch;
            } else {
              batchFRQ = questionsInThisBatch;
            }

            // Calculate difficulty distribution for this batch (equal thirds)
            const easyCount = Math.floor(questionsInThisBatch / 3);
            const mediumCount = Math.floor(questionsInThisBatch / 3);
            const hardCount = questionsInThisBatch - easyCount - mediumCount;

            try {
              const batchQuestions = await generateBatch(
                contentSummary,
                isFromPrompt,
                batchMCQ,
                batchFRQ,
                batch,
                existingQuestionTexts,
                { easy: easyCount, medium: mediumCount, hard: hardCount }
              );

              // Add new question texts to avoid duplicates
              for (const q of batchQuestions) {
                existingQuestionTexts.push(q.question.substring(0, 100));
              }

              allQuestions.push(...batchQuestions);

              // Send progress update after batch completion
              sendEvent({
                type: 'progress',
                current: allQuestions.length,
                total: totalQuestions,
                status: `Generated ${allQuestions.length}/${totalQuestions} questions`,
              });
            } catch (batchError) {
              console.error(`Error generating batch ${batch}:`, batchError);
              if (allQuestions.length === 0) {
                throw batchError;
              }
            }
          }

          // Generate title based on content
          let title = 'Practice Test';
          if (isFromPrompt) {
            const words = contentSummary.split(' ').slice(0, 5).join(' ');
            title = `Practice Test: ${words}${contentSummary.split(' ').length > 5 ? '...' : ''}`;
          }

          // Final deduplication check
          const seenQuestions = new Set<string>();
          const uniqueQuestions = allQuestions.filter(q => {
            const key = q.question.toLowerCase().substring(0, 80);
            if (seenQuestions.has(key)) {
              return false;
            }
            seenQuestions.add(key);
            return true;
          });

          // Renumber questions after deduplication
          const finalQuestions = uniqueQuestions.map((q, idx) => ({
            ...q,
            id: `q${idx + 1}`,
          }));

          const result = {
            title,
            questions: finalQuestions,
            metadata: {
              totalQuestions: finalQuestions.length,
              mcqCount: finalQuestions.filter(q => q.type === 'mcq').length,
              frqCount: finalQuestions.filter(q => q.type === 'frq').length,
              difficultyBreakdown: {
                easy: finalQuestions.filter(q => q.difficulty === 'easy').length,
                medium: finalQuestions.filter(q => q.difficulty === 'medium').length,
                hard: finalQuestions.filter(q => q.difficulty === 'hard').length,
              },
            },
          };

          // Send complete event
          sendEvent({
            type: 'complete',
            data: result,
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Generate practice test error:', error);
          sendEvent({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to generate practice test',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generate practice test error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate practice test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Configure longer timeout for this route
export const maxDuration = 300; // 5 minutes for large question counts
