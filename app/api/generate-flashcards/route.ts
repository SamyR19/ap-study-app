import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, count = 10, existingTerms = [] } = await request.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existingTermsPrompt = existingTerms.length > 0
      ? `\n\nAvoid creating flashcards for these terms that already exist: ${existingTerms.join(', ')}`
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator specializing in AP exam preparation. Generate flashcards from the provided text.

Rules:
- Create exactly ${count} flashcards
- Each flashcard should have a clear, concise "front" (term/question) and "back" (definition/answer)
- Focus on key concepts, definitions, and important facts
- Make the content suitable for AP-level study
- Front should be brief (a term, concept, or short question)
- Back should be a complete but concise explanation
- Also generate a short, descriptive title (3-6 words) for this flashcard set
- Also generate a brief description (1 sentence) for this flashcard set${existingTermsPrompt}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short descriptive title",
  "description": "Brief one-sentence description of what these flashcards cover.",
  "flashcards": [
    { "front": "term or question", "back": "definition or answer" }
  ]
}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
    console.error('Generate flashcards error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate flashcards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
