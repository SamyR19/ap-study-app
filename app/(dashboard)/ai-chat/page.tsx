'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowUp,
  Mic,
  ChevronDown,
  X,
  Search,
  Image as ImageIcon,
  FileText,
  History,
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Sparkles,
  Check,
  Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/components/providers/ThemeProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinkingText?: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
}

const models = [
  { id: 'gpt-4o-mini', name: 'GPT-4.5' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5' },
];

// Generate thinking text based on question content
const generateThinkingText = (question: string): string => {
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes('what is') || lowerQ.includes('explain') || lowerQ.includes('define')) {
    return 'Identified concept and prepared clear explanation';
  }
  if (lowerQ.includes('how') || lowerQ.includes('solve') || lowerQ.includes('calculate')) {
    return 'Analyzed problem and prepared step-by-step solution';
  }
  if (lowerQ.includes('why')) {
    return 'Researched reasoning and prepared detailed explanation';
  }
  if (lowerQ.includes('example') || lowerQ.includes('practice')) {
    return 'Generated relevant examples and practice problems';
  }
  if (lowerQ.includes('code') || lowerQ.includes('program') || lowerQ.includes('java') || lowerQ.includes('python')) {
    return 'Identified programming concept and prepared clear explanation';
  }
  return 'Analyzed question and prepared comprehensive response';
};

// Custom code block component
const CodeBlock = ({ language, children, isDark }: { language: string; children: string; isDark: boolean }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-border bg-muted/50">
      {/* Header - blends into background */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-muted-foreground font-medium">{language || 'code'}</span>
        <button
          onClick={copyCode}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <div className="px-4 pb-4 overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'text'}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={false}
          wrapLines={false}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.7',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            },
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function AIChatPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [thinkingText, setThinkingText] = useState('');
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userHasScrolledUp = useRef(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    loadChatSessions();
  }, []);

  // Handle scroll to detect if user scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      // If user scrolled up (away from bottom), mark it
      if (scrollTop < lastScrollTop.current && !isNearBottom) {
        userHasScrolledUp.current = true;
      }

      // If user scrolled back to bottom, reset
      if (isNearBottom) {
        userHasScrolledUp.current = false;
      }

      lastScrollTop.current = scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Only auto-scroll if user hasn't scrolled up
  useEffect(() => {
    if (!userHasScrolledUp.current) {
      scrollToBottom();
    }
  }, [messages]);

  // For streaming, only scroll if near bottom
  useEffect(() => {
    if (streamingContent && !userHasScrolledUp.current) {
      scrollToBottom();
    }
  }, [streamingContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset scroll tracking when sending a new message
  const resetScrollTracking = () => {
    userHasScrolledUp.current = false;
  };

  const loadChatSessions = useCallback(async () => {
    const stored = localStorage.getItem('aceai_chat_sessions');
    if (stored) {
      const sessions = JSON.parse(stored).map((s: ChatSession) => ({
        ...s,
        updatedAt: new Date(s.updatedAt),
      }));
      setChatSessions(sessions);
    }
  }, []);

  const saveChatSession = useCallback((newMessages: Message[]) => {
    const sessionId = currentSessionId || `session_${Date.now()}`;
    const session: ChatSession = {
      id: sessionId,
      title: newMessages[0]?.content.slice(0, 50) || 'New Chat',
      lastMessage: newMessages[newMessages.length - 1]?.content.slice(0, 100) || '',
      updatedAt: new Date(),
    };

    const stored = localStorage.getItem('aceai_chat_sessions');
    const sessions: ChatSession[] = stored ? JSON.parse(stored) : [];

    const existingIndex = sessions.findIndex(s => s.id === sessionId);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }

    localStorage.setItem(`aceai_chat_${sessionId}`, JSON.stringify(newMessages));
    localStorage.setItem('aceai_chat_sessions', JSON.stringify(sessions));

    setChatSessions(sessions);
    setCurrentSessionId(sessionId);
  }, [currentSessionId]);

  const loadChatSession = (sessionId: string) => {
    const stored = localStorage.getItem(`aceai_chat_${sessionId}`);
    if (stored) {
      const loadedMessages = JSON.parse(stored).map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    }
    setShowHistoryModal(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistoryModal(false);
    setIsSelectMode(false);
    setSelectedSessions(new Set());
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedSessions(new Set());
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const deleteSelectedSessions = () => {
    // Remove from localStorage
    selectedSessions.forEach(sessionId => {
      localStorage.removeItem(`aceai_chat_${sessionId}`);
    });

    // Update sessions list
    const stored = localStorage.getItem('aceai_chat_sessions');
    if (stored) {
      const sessions: ChatSession[] = JSON.parse(stored);
      const filtered = sessions.filter(s => !selectedSessions.has(s.id));
      localStorage.setItem('aceai_chat_sessions', JSON.stringify(filtered));
      setChatSessions(filtered.map(s => ({ ...s, updatedAt: new Date(s.updatedAt) })));
    }

    // Clear selection
    setSelectedSessions(new Set());
    setIsSelectMode(false);

    // If current chat was deleted, clear it
    if (currentSessionId && selectedSessions.has(currentSessionId)) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setIsSelectMode(false);
    setSelectedSessions(new Set());
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const thinking = generateThinkingText(input.trim());
    setThinkingText(thinking);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    resetScrollTracking(); // Reset scroll tracking for new message

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
        thinkingText: thinking,
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        saveChatSession(newMessages);
        return newMessages;
      });
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setThinkingText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (type: 'image' | 'file') => {
    setShowAttachMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*';
      fileInputRef.current.click();
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const filteredSessions = chatSessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Markdown components with custom code block rendering
  const markdownComponents = {
    code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;

      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
            {children}
          </code>
        );
      }

      return (
        <CodeBlock language={match[1]} isDark={isDark}>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    },
    pre({ children }: { children?: React.ReactNode }) {
      return <>{children}</>;
    },
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setInput(prev => `${prev} [Attached: ${file.name}]`);
          }
        }}
      />

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streamingContent ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground">Ask me anything about your AP studies</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto pt-6 pb-24 px-6">
            {messages.map((message, index) => (
              <div key={message.id} className="mb-10">
                {message.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-muted text-foreground rounded-2xl rounded-tr-sm px-5 py-3">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Thinking text */}
                    {message.thinkingText && (
                      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                        {message.thinkingText}
                        <span className="text-muted-foreground/50">›</span>
                      </p>
                    )}

                    {/* Response content */}
                    <div className="prose prose-base max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-foreground prose-p:leading-7 prose-p:my-5 prose-strong:text-foreground prose-strong:font-semibold prose-ul:my-5 prose-ul:pl-0 prose-ol:my-5 prose-li:text-foreground prose-li:leading-7 prose-li:my-2 prose-li:pl-0">
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 mt-6">
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors group"
                        title="Copy"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-muted transition-colors group"
                        title="Good response"
                      >
                        <ThumbsUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-muted transition-colors group"
                        title="Bad response"
                      >
                        <ThumbsDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-muted transition-colors group"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </button>
                    </div>

                    {/* AceAI Logo */}
                    {index === messages.length - 1 && message.role === 'assistant' && !isLoading && (
                      <div className="mt-8">
                        <Sparkles className="w-6 h-6 text-primary-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Streaming content */}
            {isLoading && streamingContent && (
              <div className="mb-10">
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                  {thinkingText}
                  <span className="text-muted-foreground/50">›</span>
                </p>
                <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-strong:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:text-foreground prose-li:leading-relaxed prose-li:mb-2">
                  <ReactMarkdown components={markdownComponents}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Loading state - only show if no streaming content yet */}
            {isLoading && !streamingContent && (
              <div className="mb-10">
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                  {thinkingText}
                  <span className="text-muted-foreground/50">›</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-background p-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-background rounded-2xl border border-border shadow-sm">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for AP help..."
              rows={1}
              style={{ minHeight: '24px' }}
              className="w-full px-4 pt-4 pb-2 resize-none outline-none text-foreground placeholder:text-muted-foreground bg-transparent text-base"
            />

            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                {/* Attach Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full left-0 mb-2 bg-background rounded-xl shadow-lg border border-border overflow-hidden w-48"
                      >
                        <button
                          onClick={() => handleFileSelect('image')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Upload image</span>
                        </button>
                        <button
                          onClick={() => handleFileSelect('file')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Upload file</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* History Button */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <History className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                {/* Model Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{selectedModel.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showModelDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full right-0 mb-2 bg-background rounded-xl shadow-lg border border-border overflow-hidden w-40"
                      >
                        {models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                              selectedModel.id === model.id
                                ? 'bg-primary-50 text-primary-600'
                                : 'hover:bg-muted/50 text-foreground'
                            }`}
                          >
                            {model.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mic Button */}
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Mic className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    input.trim() && !isLoading
                      ? 'bg-foreground hover:bg-foreground/90'
                      : 'bg-muted'
                  }`}
                >
                  <ArrowUp className={`w-4 h-4 ${input.trim() && !isLoading ? 'text-white' : 'text-muted-foreground'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeHistoryModal}
              className="absolute inset-0 bg-black/20"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeHistoryModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <h2 className="text-2xl font-bold text-foreground">Chats</h2>
                </div>
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-white rounded-lg font-medium hover:bg-foreground/90 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New chat
                </button>
              </div>

              {/* Search */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your chats..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Chat Count & Actions */}
              <div className="px-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredSessions.length} chats
                  </span>
                  <button
                    onClick={toggleSelectMode}
                    className={`text-sm font-medium transition-colors ${
                      isSelectMode ? 'text-foreground' : 'text-primary-500 hover:text-primary-600'
                    }`}
                  >
                    {isSelectMode ? 'Cancel' : 'Select'}
                  </button>
                </div>
                {isSelectMode && selectedSessions.size > 0 && (
                  <button
                    onClick={deleteSelectedSessions}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedSessions.size})
                  </button>
                )}
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No chats yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Start a conversation to see it here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 py-4 -mx-2 px-2 rounded-lg transition-colors hover:bg-muted/50"
                      >
                        {isSelectMode && (
                          <button
                            onClick={() => toggleSessionSelection(session.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              selectedSessions.has(session.id)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-border hover:border-primary-400'
                            }`}
                          >
                            {selectedSessions.has(session.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => isSelectMode ? toggleSessionSelection(session.id) : loadChatSession(session.id)}
                          className="flex-1 text-left"
                        >
                          <p className="font-medium text-foreground mb-1 truncate">
                            {session.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last message {formatTimeAgo(new Date(session.updatedAt))}
                          </p>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside handlers */}
      {showModelDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowModelDropdown(false)} />
      )}
      {showAttachMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
      )}
    </div>
  );
}
