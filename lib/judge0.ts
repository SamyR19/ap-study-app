import type { Judge0Submission, Judge0Result } from '@/types';

const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_API_URL || 'https://ce.judge0.com';

// Common language IDs for Judge0
export const LANGUAGE_IDS = {
  python: 71,      // Python (3.8.1)
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  cpp: 54,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
} as const;

export async function submitCode(submission: Judge0Submission): Promise<{ token: string }> {
  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit code: ${response.statusText}`);
  }

  return response.json();
}

export async function getSubmissionResult(token: string): Promise<Judge0Result> {
  const response = await fetch(
    `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get submission result: ${response.statusText}`);
  }

  return response.json();
}

export async function submitAndWait(
  submission: Judge0Submission,
  maxAttempts = 10,
  delayMs = 1000
): Promise<Judge0Result> {
  const { token } = await submitCode(submission);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    const result = await getSubmissionResult(token);

    // Status ID 1 = In Queue, 2 = Processing
    if (result.status.id !== 1 && result.status.id !== 2) {
      return result;
    }
  }

  throw new Error('Submission timed out');
}
