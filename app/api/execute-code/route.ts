import { NextRequest, NextResponse } from 'next/server';
import { executeCode, validateCode } from '@/lib/code-executor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language = 'java', testCases, stdin } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // If test cases provided, validate against them
    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
      const validationResult = await validateCode(language, code, testCases);
      return NextResponse.json({
        type: 'validation',
        passed: validationResult.passed,
        results: validationResult.results,
      });
    }

    // Otherwise just execute the code
    const result = await executeCode(language, code, stdin);

    return NextResponse.json({
      output: result.output,
      error: result.error,
      status: result.exitCode === 0 ? 'Completed' : 'Error',
      time: result.executionTime,
    });
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute code. The code execution service may be temporarily unavailable.' },
      { status: 500 }
    );
  }
}
