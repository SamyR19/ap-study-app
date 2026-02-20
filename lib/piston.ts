// Piston API - Free code execution engine
// https://github.com/engineer-man/piston

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: { name?: string; content: string }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonExecuteResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  language: string;
  version: string;
}

// Get available runtimes
export async function getRuntimes(): Promise<PistonRuntime[]> {
  const response = await fetch(`${PISTON_API_URL}/runtimes`);
  if (!response.ok) {
    throw new Error('Failed to fetch runtimes');
  }
  return response.json();
}

// Execute code
export async function executeCode(
  language: string,
  code: string,
  stdin?: string
): Promise<{ output: string; error?: string; exitCode: number }> {
  // Map common language names to Piston language identifiers
  const languageMap: Record<string, { language: string; version: string }> = {
    java: { language: 'java', version: '15.0.2' },
    python: { language: 'python', version: '3.10.0' },
    python3: { language: 'python', version: '3.10.0' },
    javascript: { language: 'javascript', version: '18.15.0' },
    js: { language: 'javascript', version: '18.15.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
    ts: { language: 'typescript', version: '5.0.3' },
    cpp: { language: 'c++', version: '10.2.0' },
    'c++': { language: 'c++', version: '10.2.0' },
    c: { language: 'c', version: '10.2.0' },
  };

  const langConfig = languageMap[language.toLowerCase()];
  if (!langConfig) {
    return {
      output: '',
      error: `Unsupported language: ${language}`,
      exitCode: 1,
    };
  }

  // For Java, wrap code in a Main class if needed
  let processedCode = code;
  if (langConfig.language === 'java') {
    const hasClass = code.includes('class ');
    const hasMainMethod = code.includes('public static void main');

    if (!hasClass && !hasMainMethod) {
      // Wrap snippet in Main class
      processedCode = `
public class Main {
    public static void main(String[] args) {
        ${code}
    }
}`;
    } else if (!hasClass && hasMainMethod) {
      // Has main but no class
      processedCode = `
public class Main {
    ${code}
}`;
    }
  }

  const request: PistonExecuteRequest = {
    language: langConfig.language,
    version: langConfig.version,
    files: [{ content: processedCode }],
    stdin: stdin || '',
    run_timeout: 10000, // 10 second timeout
    compile_timeout: 10000,
  };

  try {
    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        output: '',
        error: `Execution failed: ${errorText}`,
        exitCode: 1,
      };
    }

    const result: PistonExecuteResponse = await response.json();

    // Check for compilation errors
    if (result.compile && result.compile.code !== 0) {
      return {
        output: result.compile.output || result.compile.stderr,
        error: result.compile.stderr || 'Compilation failed',
        exitCode: result.compile.code,
      };
    }

    // Return run result
    const output = result.run.stdout || result.run.output;
    const error = result.run.stderr || (result.run.code !== 0 ? 'Runtime error' : undefined);

    return {
      output: output.trim(),
      error: error?.trim(),
      exitCode: result.run.code,
    };
  } catch (err) {
    return {
      output: '',
      error: err instanceof Error ? err.message : 'Unknown error',
      exitCode: 1,
    };
  }
}

// Validate code against expected outputs
export async function validateCode(
  language: string,
  code: string,
  testCases: { input: string; expectedOutput: string }[]
): Promise<{
  passed: boolean;
  results: { input: string; expected: string; actual: string; passed: boolean }[];
}> {
  const results = [];

  for (const testCase of testCases) {
    const result = await executeCode(language, code, testCase.input);
    const actualOutput = result.output.trim();
    const expectedOutput = testCase.expectedOutput.trim();
    const passed = actualOutput === expectedOutput;

    results.push({
      input: testCase.input,
      expected: expectedOutput,
      actual: actualOutput,
      passed,
    });
  }

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
