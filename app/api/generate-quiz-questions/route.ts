import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MCQQuestion {
  type: 'mcq';
  id: string;
  question: string;
  choices: { index: number; text: string }[];
  correctAnswerIndex: number;
}

interface FRQQuestion {
  type: 'frq';
  id: string;
  question: string;
  starterCode: string;
  language: string;
  testCases: { input: string; expectedOutput: string }[];
  hints: string[];
}

type QuizQuestion = MCQQuestion | FRQQuestion;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceType,
      prompt,
      flashcardContent,
      questionCount = 10,
      questionTypes = ['mcq'],
      units,
    } = body;

    if (!sourceType) {
      return NextResponse.json(
        { error: 'Source type is required' },
        { status: 400 }
      );
    }

    // Build the prompt for AI
    const systemPrompt = `You are an expert AP Computer Science A teacher creating quiz questions.
Generate exactly ${questionCount} questions for a live quiz.

IMPORTANT RULES:
- Questions should be appropriate for AP Computer Science A level
- For MCQ: Create 4 distinct choices, only ONE correct answer
- For FRQ: Create coding problems with clear requirements and test cases
- Make questions progressively more challenging
- Include a mix of conceptual and practical questions
- All code should be in Java`;

    let userPrompt = '';

    if (sourceType === 'ai') {
      userPrompt = `Create a quiz about: ${prompt}`;
      if (units) {
        userPrompt += `\n\nFocus on these specific topics/units: ${units}`;
      }
    } else if (sourceType === 'flashcards' && flashcardContent) {
      userPrompt = `Create a quiz based on these flashcard terms and definitions:\n\n${flashcardContent}`;
      if (units) {
        userPrompt += `\n\nFocus on: ${units}`;
      }
    }

    // Determine question type distribution
    const includeMCQ = questionTypes.includes('mcq');
    const includeFRQ = questionTypes.includes('frq');

    let mcqCount = questionCount;
    let frqCount = 0;

    if (includeMCQ && includeFRQ) {
      // Mixed mode: 70% MCQ, 30% FRQ
      frqCount = Math.max(1, Math.floor(questionCount * 0.3));
      mcqCount = questionCount - frqCount;
    } else if (includeFRQ && !includeMCQ) {
      // FRQ only
      frqCount = questionCount;
      mcqCount = 0;
    }

    userPrompt += `\n\nGenerate ${mcqCount} multiple choice questions${frqCount > 0 ? ` and ${frqCount} coding (FRQ) questions` : ''}.`;

    userPrompt += `\n\nRespond with a JSON array of questions in this exact format:
{
  "questions": [
    {
      "type": "mcq",
      "id": "1",
      "question": "Question text here",
      "choices": [
        {"index": 0, "text": "Option A"},
        {"index": 1, "text": "Option B"},
        {"index": 2, "text": "Option C"},
        {"index": 3, "text": "Option D"}
      ],
      "correctAnswerIndex": 0
    },
    {
      "type": "frq",
      "id": "2",
      "question": "Write a method that...",
      "starterCode": "public static int methodName(int param) {\\n    // Your code here\\n}",
      "language": "java",
      "testCases": [
        {"input": "", "expectedOutput": "expected result"}
      ],
      "hints": ["Hint 1", "Hint 2"]
    }
  ]
}

Only output valid JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse the JSON response
    let questions: QuizQuestion[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions || [];
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse generated questions' },
        { status: 500 }
      );
    }

    // Validate and clean up questions
    questions = questions.map((q, idx) => ({
      ...q,
      id: String(idx + 1),
    }));

    return NextResponse.json({
      questions,
      questionCount: questions.length,
    });
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}
