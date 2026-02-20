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

// Common Java error patterns and user-friendly messages
const JAVA_ERROR_PATTERNS: { pattern: RegExp; message: (match: RegExpMatchArray) => string }[] = [
  {
    pattern: /error: cannot find symbol\s+symbol:\s+class (\w+)/,
    message: (m) => `Class '${m[1]}' not found. Did you forget to import it? Try adding: import java.util.${m[1]};`,
  },
  {
    pattern: /error: cannot find symbol\s+symbol:\s+method (\w+)\(/,
    message: (m) => `Method '${m[1]}()' not found. Check the spelling and make sure it's defined.`,
  },
  {
    pattern: /error: cannot find symbol\s+symbol:\s+variable (\w+)/,
    message: (m) => `Variable '${m[1]}' not found. Make sure it's declared before use.`,
  },
  {
    pattern: /error: ';' expected/,
    message: () => `Missing semicolon (;). Java statements must end with a semicolon.`,
  },
  {
    pattern: /error: '([^']+)' expected/,
    message: (m) => `Missing '${m[1]}'. Check your syntax.`,
  },
  {
    pattern: /error: incompatible types: (\w+) cannot be converted to (\w+)/,
    message: (m) => `Type mismatch: Cannot convert ${m[1]} to ${m[2]}. Check your variable types.`,
  },
  {
    pattern: /error: variable (\w+) might not have been initialized/,
    message: (m) => `Variable '${m[1]}' might not be initialized. Assign a value before using it.`,
  },
  {
    pattern: /error: unreported exception (\w+)/,
    message: (m) => `Unhandled exception: ${m[1]}. Add try-catch or throws clause.`,
  },
  {
    pattern: /error: method (\w+) in class (\w+) cannot be applied to given types/,
    message: (m) => `Wrong arguments for method '${m[1]}()' in class '${m[2]}'. Check parameter types.`,
  },
  {
    pattern: /error: class (\w+) is public, should be declared in a file named/,
    message: () => `Public class name must match filename. For online execution, use 'class prog' instead of 'public class'.`,
  },
  {
    pattern: /java\.lang\.ArrayIndexOutOfBoundsException: Index (\d+)/,
    message: (m) => `Array index out of bounds: tried to access index ${m[1]}. Array might be smaller than expected.`,
  },
  {
    pattern: /java\.lang\.NullPointerException/,
    message: () => `NullPointerException: Tried to use a null object. Make sure objects are initialized.`,
  },
  {
    pattern: /java\.util\.NoSuchElementException/,
    message: () => `NoSuchElementException: Tried to read input when none was available. Check your Scanner usage.`,
  },
  {
    pattern: /java\.lang\.NumberFormatException/,
    message: () => `NumberFormatException: Tried to convert invalid text to a number. Check your input format.`,
  },
  {
    pattern: /java\.lang\.StringIndexOutOfBoundsException/,
    message: () => `String index out of bounds: Tried to access a character position that doesn't exist.`,
  },
];

// Parse Java error to provide user-friendly message
function parseJavaError(error: string): string {
  // Extract line number if present
  const lineMatch = error.match(/prog\.java:(\d+):/);
  const lineInfo = lineMatch ? `Line ${lineMatch[1]}: ` : '';

  // Try to match known error patterns
  for (const { pattern, message } of JAVA_ERROR_PATTERNS) {
    const match = error.match(pattern);
    if (match) {
      return lineInfo + message(match);
    }
  }

  // If no pattern matched, clean up the error message
  let cleanError = error
    .replace(/prog\.java:\d+: error: /g, '')
    .replace(/\s+symbol:.*\n/g, '\n')
    .replace(/\s+location:.*\n/g, '\n')
    .replace(/\^\n/g, '\n')
    .replace(/\d+ errors?\n?/g, '')
    .trim();

  // Limit error length
  if (cleanError.length > 500) {
    cleanError = cleanError.substring(0, 500) + '...';
  }

  return lineInfo + (cleanError || 'Compilation or runtime error occurred.');
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

  // Check for common imports that might be missing
  const needsImports: string[] = [];

  // Check if Scanner is used but not imported
  if (/\bScanner\b/.test(code) && !/import\s+java\.util\.Scanner/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.Scanner;');
  }

  // Check if ArrayList is used but not imported
  if (/\bArrayList\b/.test(code) && !/import\s+java\.util\.ArrayList/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.ArrayList;');
  }

  // Check if Arrays is used but not imported
  if (/\bArrays\b/.test(code) && !/import\s+java\.util\.Arrays/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.Arrays;');
  }

  // Check if List is used but not imported
  if (/\bList\b/.test(code) && !/import\s+java\.util\.List/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.List;');
  }

  // Check if HashMap/Map is used but not imported
  if (/\bHashMap\b/.test(code) && !/import\s+java\.util\.HashMap/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.HashMap;');
  }
  if (/\bMap\b/.test(code) && !/import\s+java\.util\.Map/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.Map;');
  }

  // Check if Random is used but not imported
  if (/\bRandom\b/.test(code) && !/import\s+java\.util\.Random/.test(code) && !/import\s+java\.util\.\*/.test(code)) {
    needsImports.push('import java.util.Random;');
  }

  // Add missing imports at the beginning
  let processedCode = code;
  if (needsImports.length > 0) {
    // Find where to insert imports (after any existing imports or at the beginning)
    const importMatch = processedCode.match(/^((?:import\s+[\w.*]+;\s*\n?)*)/m);
    if (importMatch && importMatch[0]) {
      // Add after existing imports
      const insertPos = importMatch[0].length;
      processedCode = processedCode.slice(0, insertPos) + needsImports.join('\n') + '\n' + processedCode.slice(insertPos);
    } else {
      // Add at the beginning
      processedCode = needsImports.join('\n') + '\n' + processedCode;
    }
  }

  const hasPublicClass = /public\s+class\s+\w+/.test(processedCode);
  const hasClass = /class\s+\w+/.test(processedCode);
  const hasMainMethod = /public\s+static\s+void\s+main/.test(processedCode);

  if (!hasClass && !hasMainMethod) {
    // Just code snippets - wrap in prog class
    return `${needsImports.join('\n')}\n\nclass prog {
    public static void main(String[] args) {
        ${code}
    }
}`;
  } else if (!hasClass && hasMainMethod) {
    // Has main but no class
    return `${needsImports.join('\n')}\n\nclass prog {
    ${code}
}`;
  } else if (hasPublicClass) {
    // Has public class - rename it to prog
    return processedCode.replace(/public\s+class\s+\w+/, 'public class prog');
  } else if (hasClass) {
    // Has non-public class - should work, but let's ensure main class is prog
    // Find the first class name and rename it to prog
    const classMatch = processedCode.match(/class\s+(\w+)/);
    if (classMatch) {
      const className = classMatch[1];
      if (className !== 'prog') {
        return processedCode.replace(new RegExp(`class\\s+${className}`), 'class prog');
      }
    }
  }

  return processedCode;
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
      error: `Unsupported language: ${language}. Supported languages: Java, Python, JavaScript, C++, C`,
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
      if (response.status === 429) {
        return {
          output: '',
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          exitCode: 1,
        };
      }
      if (response.status >= 500) {
        return {
          output: '',
          error: 'Code execution service is temporarily unavailable. Please try again later.',
          exitCode: 1,
        };
      }
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
      const userFriendlyError = language.toLowerCase() === 'java'
        ? parseJavaError(compilerError)
        : compilerError;
      return {
        output: compilerOutput,
        error: `Compilation Error:\n${userFriendlyError}`,
        exitCode: 1,
      };
    }

    // Check for runtime errors
    if (result.status !== '0' && result.status !== 0) {
      const errorMessage = programError || `Program exited with code: ${result.status}`;
      const userFriendlyError = language.toLowerCase() === 'java'
        ? parseJavaError(errorMessage)
        : errorMessage;
      return {
        output: programOutput.trim(),
        error: `Runtime Error:\n${userFriendlyError}`,
        exitCode: parseInt(result.status) || 1,
      };
    }

    return {
      output: programOutput.trim(),
      error: programError ? programError.trim() : undefined,
      exitCode: 0,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    if (errorMessage.includes('fetch')) {
      return {
        output: '',
        error: 'Network error: Unable to connect to code execution service. Check your internet connection.',
        exitCode: 1,
      };
    }

    return {
      output: '',
      error: `Execution failed: ${errorMessage}`,
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
