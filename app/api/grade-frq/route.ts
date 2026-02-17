import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RubricItem {
  id: string;
  description: string;
  points: number;
  criteria: string[];
}

interface GradeRequest {
  code: string;
  language: string;
  prompt: string;
  rubric: RubricItem[];
  sampleSolution?: string;
  maxPoints: number;
}

interface RubricScore {
  id: string;
  name: string;
  pointsEarned: number;
  pointsPossible: number;
  feedback: string;
  criteria: { description: string; met: boolean }[];
}

interface GradeResponse {
  score: number;
  maxScore: number;
  rubricScores: RubricScore[];
  strengths: string[];
  improvements: string[];
  commonMistakes: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: GradeRequest = await request.json();
    const { code, language, prompt, rubric, sampleSolution, maxPoints } = body;

    // Validate input
    if (!code || !prompt || !rubric) {
      return NextResponse.json(
        { error: 'Code, prompt, and rubric are required' },
        { status: 400 }
      );
    }

    // Build the grading prompt
    const gradingPrompt = `You are an experienced AP Computer Science teacher grading a student's Free Response Question (FRQ) submission.

## Question Prompt:
${prompt}

## Grading Rubric:
${rubric.map((item, idx) => `
### ${idx + 1}. ${item.description} (${item.points} points)
Criteria:
${item.criteria.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
`).join('\n')}

## Student's Submitted Code (${language}):
\`\`\`${language}
${code}
\`\`\`

${sampleSolution ? `## Sample Solution (for reference):
\`\`\`${language}
${sampleSolution}
\`\`\`` : ''}

## Instructions:
Grade the student's code against each rubric item. Be fair but thorough. Consider:
1. Correctness of logic and implementation
2. Proper use of language constructs
3. Edge cases and error handling
4. Code organization and readability

Respond with a JSON object in this exact format:
{
  "rubricScores": [
    {
      "id": "rubric item id",
      "name": "rubric item description (short)",
      "pointsEarned": number,
      "pointsPossible": number,
      "feedback": "specific feedback for this rubric item",
      "criteria": [
        { "description": "criterion description", "met": true/false }
      ]
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["specific improvement suggestion 1", "specific improvement suggestion 2"],
  "commonMistakes": ["learning point about common mistakes or concepts"]
}

Be encouraging but honest. Focus on helping the student learn.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AP Computer Science grader. Always respond with valid JSON only, no markdown formatting or code blocks around the JSON.',
        },
        {
          role: 'user',
          content: gradingPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let gradeResult: Omit<GradeResponse, 'score' | 'maxScore'>;
    try {
      // Remove any markdown code block formatting if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      gradeResult = JSON.parse(cleanedResponse);
    } catch {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse grading response');
    }

    // Calculate total score
    const totalScore = gradeResult.rubricScores.reduce(
      (sum, item) => sum + item.pointsEarned,
      0
    );

    const response: GradeResponse = {
      score: totalScore,
      maxScore: maxPoints,
      ...gradeResult,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json(
      { error: 'Failed to grade submission. Please try again.' },
      { status: 500 }
    );
  }
}
