import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };

export async function generateExplanation(question: string, answer: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AP tutor. Explain concepts clearly and concisely for high school students.',
      },
      {
        role: 'user',
        content: `Explain why the answer to this question is "${answer}":\n\n${question}`,
      },
    ],
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate explanation.';
}

export async function getStudyHint(topic: string, difficulty: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AP tutor. Provide concise study hints.',
      },
      {
        role: 'user',
        content: `Give a helpful study hint for the AP topic: ${topic} at ${difficulty} difficulty level.`,
      },
    ],
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content || 'Keep practicing!';
}
