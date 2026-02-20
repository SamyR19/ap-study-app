import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator specializing in AP exam preparation. Generate a comprehensive study guide from the provided text.

Create a structured study guide with:
1. A descriptive title
2. An outline with sections and subsections
3. A quick reference section with key terms, facts to memorize, and cause-effect relationships

Rules:
- Make content suitable for AP-level study
- Be thorough but concise
- Focus on the most important concepts
- Include 3-6 main sections in the outline
- Include 5-10 key terms with clear definitions
- Include 3-7 important facts to memorize
- Include 2-5 cause-effect relationships if applicable

Respond ONLY with valid JSON in this exact format:
{
  "title": "Study Guide Title",
  "outline": {
    "sections": [
      {
        "title": "Section Title",
        "content": "Section overview content",
        "subsections": [
          {
            "title": "Subsection Title",
            "content": "Detailed content for this subsection"
          }
        ]
      }
    ]
  },
  "quickReference": {
    "keyTerms": [
      { "term": "Term", "definition": "Definition" }
    ],
    "factsToMemorize": [
      "Important fact 1",
      "Important fact 2"
    ],
    "causeEffect": [
      { "cause": "Cause description", "effect": "Effect description" }
    ]
  }
}`,
        },
        {
          role: 'user',
          content: text,
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
    console.error('Generate study guide error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate study guide' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
