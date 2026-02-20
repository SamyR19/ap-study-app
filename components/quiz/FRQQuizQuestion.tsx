'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, Loader2, Check, X, Clock } from 'lucide-react';

interface FRQQuestion {
  id: string;
  question: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  hints?: string[];
  language: string;
}

interface FRQQuizQuestionProps {
  question: FRQQuestion;
  timeLeft: number;
  onSubmit: (code: string, passed: boolean, results: TestResult[]) => void;
  hasSubmitted: boolean;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export default function FRQQuizQuestion({
  question,
  timeLeft,
  onSubmit,
  hasSubmitted,
}: FRQQuizQuestionProps) {
  const [code, setCode] = useState(question.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(question.starterCode);
    setOutput(null);
    setTestResults(null);
    setError(null);
  }, [question.id, question.starterCode]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);

    try {
      const response = await fetch('/api/execute-piston', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: question.language,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output);
      }
    } catch {
      setError('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setTestResults(null);
    setError(null);

    try {
      const response = await fetch('/api/execute-piston', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: question.language,
          testCases: question.testCases,
        }),
      });

      const result = await response.json();

      if (result.type === 'validation') {
        setTestResults(result.results);
        onSubmit(code, result.passed, result.results);
      } else if (result.error) {
        setError(result.error);
        onSubmit(code, false, []);
      }
    } catch {
      setError('Failed to validate code');
      onSubmit(code, false, []);
    } finally {
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Question */}
      <div className="w-1/3 bg-slate-900 p-6 overflow-y-auto border-r border-slate-700">
        {/* Timer */}
        <div className={`flex items-center gap-2 mb-6 ${timeLeft <= 60 ? 'text-red-400' : 'text-white/80'}`}>
          <Clock className="w-5 h-5" />
          <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Problem</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-white/90 whitespace-pre-wrap">{question.question}</p>
        </div>

        {question.hints && question.hints.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white/60 mb-2">HINTS</h3>
            <ul className="space-y-2">
              {question.hints.map((hint, idx) => (
                <li key={idx} className="text-sm text-white/70 bg-white/5 p-3 rounded-lg">
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Cases Preview */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-white/60 mb-2">TEST CASES</h3>
          <div className="space-y-2">
            {question.testCases.slice(0, 2).map((tc, idx) => (
              <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm">
                <div className="text-white/60 mb-1">Input:</div>
                <code className="text-green-400">{tc.input || '(none)'}</code>
                <div className="text-white/60 mt-2 mb-1">Expected:</div>
                <code className="text-blue-400">{tc.expectedOutput}</code>
              </div>
            ))}
            {question.testCases.length > 2 && (
              <p className="text-white/40 text-sm">+ {question.testCases.length - 2} hidden test cases</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Editor & Output */}
      <div className="flex-1 flex flex-col bg-slate-800">
        {/* Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={question.language === 'java' ? 'java' : question.language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              readOnly: hasSubmitted,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="h-48 bg-slate-900 border-t border-slate-700 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-sm font-medium text-white/80">Output</span>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning || hasSubmitted}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || hasSubmitted}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {testResults ? (
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-lg ${
                      result.passed ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.passed ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                        Test Case {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    {!result.passed && (
                      <div className="text-xs space-y-1 text-white/70">
                        <div>Expected: <code className="text-blue-400">{result.expected}</code></div>
                        <div>Got: <code className="text-red-400">{result.actual || '(no output)'}</code></div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
            ) : output !== null ? (
              <pre className="text-green-400 whitespace-pre-wrap">{output || '(no output)'}</pre>
            ) : (
              <span className="text-white/40">Run your code to see output...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
