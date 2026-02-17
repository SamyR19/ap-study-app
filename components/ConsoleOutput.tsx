'use client';

import { Button } from '@/components/ui/button';
import { Trash2, Copy, Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  isHidden?: boolean;
}

interface ConsoleOutputProps {
  output: string;
  error?: string;
  testResults?: TestResult[];
  isRunning?: boolean;
  onClear: () => void;
}

export function ConsoleOutput({
  output,
  error,
  testResults = [],
  isRunning = false,
  onClear,
}: ConsoleOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = error || output;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const passedTests = testResults.filter((t) => t.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-cream-300 overflow-hidden bg-code-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-cream-200 border-b border-cream-300">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm text-charcoal">Console Output</span>
          {testResults.length > 0 && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                passedTests === totalTests
                  ? 'bg-success-light text-success-dark'
                  : 'bg-amber-100 text-amber-700'
              )}
            >
              {passedTests}/{totalTests} tests passed
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 hover:bg-cream-300"
            disabled={!output && !error}
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 hover:bg-cream-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isRunning ? (
          <div className="flex items-center gap-2 text-charcoal-light">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running your code...
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-error font-semibold">Compilation Error:</div>
            <pre className="text-error whitespace-pre-wrap">{error}</pre>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Program Output */}
            {output && (
              <div className="space-y-2">
                <div className="text-charcoal-light text-xs uppercase tracking-wide">
                  Output:
                </div>
                <pre className="text-charcoal whitespace-pre-wrap bg-white/50 rounded-lg p-3 border border-cream-300">
                  {output}
                </pre>
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <div className="text-charcoal-light text-xs uppercase tracking-wide">
                  Test Results:
                </div>
                <div className="space-y-2">
                  {testResults.map((test) => (
                    <div
                      key={test.id}
                      className={cn(
                        'rounded-lg p-3 border',
                        test.passed
                          ? 'bg-success-light/50 border-success/30'
                          : 'bg-red-50 border-error/30'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {test.passed ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <X className="w-4 h-4 text-error" />
                        )}
                        <span
                          className={cn(
                            'font-medium',
                            test.passed ? 'text-success-dark' : 'text-red-700'
                          )}
                        >
                          {test.name}
                          {test.isHidden && ' (Hidden)'}
                        </span>
                      </div>
                      {!test.passed && !test.isHidden && (
                        <div className="mt-2 text-xs space-y-1 pl-6">
                          <div>
                            <span className="text-charcoal-light">Expected: </span>
                            <code className="text-charcoal bg-white/60 px-1 rounded">
                              {test.expected}
                            </code>
                          </div>
                          <div>
                            <span className="text-charcoal-light">Actual: </span>
                            <code className="text-error bg-white/60 px-1 rounded">
                              {test.actual}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!output && testResults.length === 0 && (
              <div className="text-charcoal-light text-center py-8">
                Run your code to see output here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
