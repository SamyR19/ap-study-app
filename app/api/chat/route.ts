import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'gpt-4o-mini' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemMessage = {
      role: 'system' as const,
      content: `You are AceAI, a helpful AI tutor specializing in AP exam preparation.

IMPORTANT - Keep responses concise and focused:
- Give direct, clear explanations without unnecessary filler
- For simple questions, keep answers to 2-4 paragraphs
- Only include code examples when specifically helpful
- Skip lengthy introductions - get straight to the point
- Don't repeat the question back or over-explain

When formatting:
- Use ## for main section headings (with blank line before)
- Use **bold** for key terms
- Use \`inline code\` for code references
- Use code blocks with language (e.g. \`\`\`java) only when showing actual code
- Use bullet points sparingly, only when listing 3+ items

Keep it brief and helpful - students want quick, clear answers.`,
    };

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
