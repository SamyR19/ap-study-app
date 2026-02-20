// Code Execution Service
// Uses Wandbox API (completely free, no API key) + browser-based JS

// Wandbox compiler names
const WANDBOX_COMPILERS: Record<string, string> = {
  java: 'openjdk-jdk-22+36',
  python: 'cpython-3.12.0',
  python3: 'cpython-3.12.0',
  javascript: 'nodejs-20.17.0',
  js: 'nodejs-20.17.0',
  nodejs: 'nodejs-20.17.0',
  cpp: 'gcc-13.2.0',
  'c++': 'gcc-13.2.0',
  c: 'gcc-13.2.0-c',
};

interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  executionTime?: number;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

// Browser-based JavaScript execution (instant, no network)
function executeJavaScriptInBrowser(code: string, input?: string): ExecutionResult {
  try {
    const logs: string[] = [];

    const mockConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      },
      error: (...args: unknown[]) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      },
      warn: (...args: unknown[]) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      },
    };

    // Parse input lines for readline simulation
    const inputLines = (input || '').split('\n');
    let inputIndex = 0;
    const readline = () => inputLines[inputIndex++] || '';

    const wrappedCode = `
      const input = ${JSON.stringify(input || '')};
      const console = arguments[0];
      const readline = arguments[1];
      ${code}
    `;

    const fn = new Function(wrappedCode);
    const result = fn(mockConsole, readline);

    if (result !== undefined) {
      logs.push(String(result));
    }

    return {
      output: logs.join('\n').trim(),
      exitCode: 0,
    };
  } catch (err) {
    return {
      output: '',
      error: err instanceof Error ? err.message : 'Execution error',
      exitCode: 1,
    };
  }
}

// Process Java code to work with Wandbox (file is saved as prog.java)
function processJavaCode(code: string): string {
  // Wandbox saves Java files as prog.java, so public class must be named "prog"
  // Or we can use a non-public class

  const hasPublicClass = /public\s+class\s+\w+/.test(code);
  const hasClass = /class\s+\w+/.test(code);
  const hasMainMethod = /public\s+static\s+void\s+main/.test(code);

  if (!hasClass && !hasMainMethod) {
    // Just code snippets - wrap in prog class
    return `class prog {
    public static void main(String[] args) {
        ${code}
    }
}`;
  } else if (!hasClass && hasMainMethod) {
    // Has main but no class
    return `class prog {
    ${code}
}`;
  } else if (hasPublicClass) {
    // Has public class - rename it to prog
    return code.replace(/public\s+class\s+\w+/, 'public class prog');
  } else if (hasClass) {
    // Has non-public class - should work, but let's ensure main class is prog
    // Find the first class name and rename it to prog
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch) {
      const className = classMatch[1];
      if (className !== 'prog') {
        return code.replace(new RegExp(`class\\s+${className}`), 'class prog');
      }
    }
  }

  return code;
}

// Wandbox API execution (free, no API key)
async function executeWithWandbox(
  language: string,
  code: string,
  stdin?: string
): Promise<ExecutionResult> {
  const compiler = WANDBOX_COMPILERS[language.toLowerCase()];

  if (!compiler) {
    return {
      output: '',
      error: `Unsupported language: ${language}. Supported: java, python, javascript, c++, c`,
      exitCode: 1,
    };
  }

  // Process Java code
  let processedCode = code;
  if (language.toLowerCase() === 'java') {
    processedCode = processJavaCode(code);
  }

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: processedCode,
        compiler: compiler,
        stdin: stdin || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();

    // Wandbox response structure:
    // - status: "0" for success, non-zero for error
    // - program_output: stdout from the program
    // - program_error: stderr from the program
    // - compiler_error: compilation errors
    // - compiler_output: compiler stdout

    const programOutput = result.program_output || '';
    const programError = result.program_error || '';
    const compilerError = result.compiler_error || '';
    const compilerOutput = result.compiler_output || '';

    // Check for compilation errors
    if (compilerError) {
      return {
        output: compilerOutput,
        error: compilerError,
        exitCode: 1,
      };
    }

    // Check for runtime errors
    if (result.status !== '0' && result.status !== 0) {
      return {
        output: programOutput.trim(),
        error: programError || `Exit code: ${result.status}`,
        exitCode: parseInt(result.status) || 1,
      };
    }

    return {
      output: programOutput.trim(),
      error: programError ? programError.trim() : undefined,
      exitCode: 0,
    };
  } catch (err) {
    return {
      output: '',
      error: err instanceof Error ? err.message : 'Failed to execute code',
      exitCode: 1,
    };
  }
}

// Main execution function
export async function executeCode(
  language: string,
  code: string,
  stdin?: string
): Promise<ExecutionResult> {
  const lang = language.toLowerCase();

  // For JavaScript in browser context, use browser execution (faster)
  if (typeof window !== 'undefined' && (lang === 'javascript' || lang === 'js')) {
    return executeJavaScriptInBrowser(code, stdin);
  }

  // For all languages (including JS on server), use Wandbox
  return executeWithWandbox(language, code, stdin);
}

// Validate code against test cases
export async function validateCode(
  language: string,
  code: string,
  testCases: { input: string; expectedOutput: string }[]
): Promise<{
  passed: boolean;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const result = await executeCode(language, code, testCase.input);
    const actualOutput = result.output.trim();
    const expectedOutput = testCase.expectedOutput.trim();

    // Normalize whitespace for comparison
    const normalizedActual = actualOutput.replace(/\r\n/g, '\n').trim();
    const normalizedExpected = expectedOutput.replace(/\r\n/g, '\n').trim();
    const passed = normalizedActual === normalizedExpected;

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
