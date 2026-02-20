import { NextRequest, NextResponse } from 'next/server';
import { executeCode, validateCode } from '@/lib/code-executor';

// This route uses the same code executor as execute-code
// Kept for backwards compatibility with existing quiz components

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, testCases, stdin } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
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
      type: 'execution',
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
    });
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
