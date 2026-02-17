'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Save, Maximize2, Minimize2, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  onRun: (code: string) => void;
  onReset: () => void;
  onCodeChange?: (code: string) => void;
  isRunning?: boolean;
  isSaved?: boolean;
  className?: string;
}

// Warm theme for Monaco
const warmTheme = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '9CA3AF', fontStyle: 'italic' },
    { token: 'keyword', foreground: '7C3AED' },
    { token: 'string', foreground: '059669' },
    { token: 'number', foreground: 'D97706' },
    { token: 'type', foreground: '2563EB' },
    { token: 'function', foreground: 'D97706' },
    { token: 'variable', foreground: '2D2D2D' },
  ],
  colors: {
    'editor.background': '#FDFCFA',
    'editor.foreground': '#2D2D2D',
    'editor.lineHighlightBackground': '#F5F3EF',
    'editor.selectionBackground': '#F4D5C680',
    'editorLineNumber.foreground': '#9CA3AF',
    'editorLineNumber.activeForeground': '#E07856',
    'editorCursor.foreground': '#E07856',
    'editor.inactiveSelectionBackground': '#F4D5C640',
  },
};

export function CodeEditor({
  initialCode,
  language = 'java',
  onRun,
  onReset,
  onCodeChange,
  isRunning = false,
  isSaved = true,
  className,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle editor mount
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define warm theme
    monaco.editor.defineTheme('warm', warmTheme);
    monaco.editor.setTheme('warm');

    // Focus editor
    editor.focus();
  };

  // Handle code change
  const handleChange: OnChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  // Run code
  const handleRun = useCallback(() => {
    onRun(code);
  }, [code, onRun]);

  // Reset code
  const handleReset = useCallback(() => {
    setCode(initialCode);
    setShowResetConfirm(false);
    onReset();
  }, [initialCode, onReset]);

  // Font size controls
  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 10));

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col rounded-xl border border-cream-300 overflow-hidden bg-white',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-cream-100 border-b border-cream-300">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg h-9 px-4"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            className="border-cream-300 hover:bg-cream-200 rounded-lg h-9"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-cream-300">
            {isSaved ? (
              <>
                <Save className="w-4 h-4 text-success" />
                <span className="text-xs text-success">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-charcoal-light" />
                <span className="text-xs text-charcoal-light">Saving...</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Controls */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-cream-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseFontSize}
              className="h-8 w-8 rounded-l-lg rounded-r-none hover:bg-cream-200"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs text-charcoal w-8 text-center">{fontSize}px</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseFontSize}
              className="h-8 w-8 rounded-r-lg rounded-l-none hover:bg-cream-200"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-9 w-9 hover:bg-cream-200"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[400px]">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            folding: true,
            lineHeight: 1.6,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            contextmenu: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-cream-50">
              <div className="text-charcoal-light">Loading editor...</div>
            </div>
          }
        />
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="font-semibold text-charcoal mb-2">Reset Code?</h3>
            <p className="text-charcoal-light text-sm mb-4">
              This will replace your code with the starter code. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 border-cream-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                className="flex-1 bg-error hover:bg-red-600 text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple code editor without toolbar (for assessments, previews, etc.)
interface SimpleCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
  readOnly?: boolean;
}

export function SimpleCodeEditor({
  value,
  onChange,
  language = 'java',
  className,
  readOnly = false,
}: SimpleCodeEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme('warm', warmTheme);
    monaco.editor.setTheme('warm');
    if (!readOnly) {
      editor.focus();
    }
  };

  const handleChange: OnChange = (newValue) => {
    onChange(newValue || '');
  };

  return (
    <div className={cn('h-full', className)}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          minimap: { enabled: false },
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          folding: true,
          lineHeight: 1.6,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          readOnly,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-cream-50">
            <div className="text-charcoal-light">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
}
