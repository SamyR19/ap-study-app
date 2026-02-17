import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_API_URL || 'https://ce.judge0.com';

// Language IDs for Judge0
const LANGUAGE_IDS: Record<string, number> = {
  java: 62,
  python: 71,
  javascript: 63,
  cpp: 54,
};

interface ExecuteRequest {
  code: string;
  language: string;
  stdin?: string;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  description?: string;
}

interface ExecuteWithTestsRequest extends ExecuteRequest {
  testCases?: TestCase[];
}

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function submitCode(code: string, languageId: number, stdin?: string) {
  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: stdin ? Buffer.from(stdin).toString('base64') : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Judge0 API error: ${response.status}`);
  }

  return response.json();
}

function decodeBase64(str: string | null): string {
  if (!str) return '';
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body: ExecuteWithTestsRequest = await request.json();
    const { code, language, stdin, testCases } = body;

    // Validate input
    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    // If there are test cases, run each one
    if (testCases && testCases.length > 0) {
      const testResults = await Promise.all(
        testCases.map(async (testCase) => {
          try {
            const result = await submitCode(code, languageId, testCase.input);
            const actualOutput = decodeBase64(result.stdout).trim();
            const expectedOutput = testCase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput;

            return {
              id: testCase.id,
              name: testCase.description || `Test Case ${testCase.id}`,
              passed,
              expected: testCase.isHidden ? undefined : expectedOutput,
              actual: testCase.isHidden ? undefined : actualOutput,
              isHidden: testCase.isHidden,
              error: result.compile_output ? decodeBase64(result.compile_output) : undefined,
            };
          } catch {
            return {
              id: testCase.id,
              name: testCase.description || `Test Case ${testCase.id}`,
              passed: false,
              error: 'Execution failed',
              isHidden: testCase.isHidden,
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        testResults,
        output: '',
        error: null,
      });
    }

    // Simple execution without test cases
    const result = await submitCode(code, languageId, stdin);

    // Process result
    const output = decodeBase64(result.stdout);
    const stderr = decodeBase64(result.stderr);
    const compileOutput = decodeBase64(result.compile_output);

    // Check for errors
    if (result.status?.id === 6) {
      // Compilation error
      return NextResponse.json({
        success: false,
        output: '',
        error: compileOutput || 'Compilation error',
        status: 'compilation_error',
      });
    }

    if (result.status?.id === 11) {
      // Runtime error
      return NextResponse.json({
        success: false,
        output: output,
        error: stderr || 'Runtime error',
        status: 'runtime_error',
      });
    }

    if (result.status?.id === 5) {
      // Time limit exceeded
      return NextResponse.json({
        success: false,
        output: output,
        error: 'Time limit exceeded (5 seconds)',
        status: 'time_limit_exceeded',
      });
    }

    return NextResponse.json({
      success: true,
      output: output,
      error: stderr || null,
      status: 'success',
      executionTime: result.time,
      memoryUsed: result.memory,
    });
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute code. Please try again.' },
      { status: 500 }
    );
  }
}
