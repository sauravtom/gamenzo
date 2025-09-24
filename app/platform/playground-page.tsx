'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './playground.css';
import MicInput from '@/components/MicInput';
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Upload, 
  Code, 
  MessageSquare, 
  Gamepad2,
  Home,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePostHog } from 'posthog-js/react';
import React from 'react';

// --- Initialize Marked ---
const marked = new Marked(
    markedHighlight({
      async: true,
      langPrefix: 'hljs language-',
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    })
);

const MemoizedMarkdown = React.memo(({ content }: { content: string }) => {
    const [html, setHtml] = useState('');
  
    useEffect(() => {
      const renderMarkdown = async () => {
        if (typeof content === 'string') {
            const parsedHtml = await marked.parse(content);
            setHtml(parsedHtml);
        }
      };
      renderMarkdown();
    }, [content]);
  
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
});
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

// --- Constants for Events ---
const POSTHOG_EVENTS = {
  AI_MESSAGE_SENT: 'ai_message_sent',
  CODE_EXECUTED: 'code_executed',
  GAME_PUBLISHED: 'game_published',
  GAME_UPDATED: 'game_updated',
  CODE_MANUALLY_EDITED: 'code_manually_edited',
  GAME_RESET: 'game_reset',
  RUNTIME_ERROR: 'runtime_error',
} as const;

// --- Custom Properties ---
const POSTHOG_PROPERTIES = {
  AI_MODEL: 'ai_model',
  MESSAGE_LENGTH: 'message_length',
  CODE_LENGTH: 'code_length',
  HAS_CODE_CONTEXT: 'has_code_context',
  ERROR_TYPE: 'error_type',
  GAME_SLUG: 'game_slug',
  EXECUTION_METHOD: 'execution_method',
} as const;

// --- Enums and Types ---
enum ChatState {
  IDLE,
  GENERATING,
  THINKING,
  CODING,
}

enum ChatTab {
  AI_CHAT,
  CODE,
}

type Message = {
  id: number;
  role: string;
  explanation: string;
  code?: string;
  isGeneratingCode?: boolean;
  thinking?: string;
};

type UserGame = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  author?: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

// --- Constants ---
const p5jsCdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js';

const SYSTEM_INSTRUCTIONS = `you're an extremely proficient creative coding agent, and can code effects, games, generative art.
write javascript code assuming it's in a live p5js environment.
return the code block.
you can include a short paragraph explaining your reasoning and the result in human readable form.
there can be no external dependencies: all functions must be in the returned code.
make extra sure that all functions are either declared in the code or part of p5js.
the user can modify the code, go along with the user's changes.`;

const EMPTY_CODE = `function setup() {
  // Setup code goes here.
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // Frame drawing code goes here.
  background(175);
}`;

// --- Main Playground Component ---
export default function PlaygroundPage() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const posthog = usePostHog();
  
  const [chatState, setChatState] = useState<ChatState>(ChatState.IDLE);
  const [selectedChatTab, setSelectedChatTab] = useState<ChatTab>(ChatTab.AI_CHAT);
  const [inputMessage, setInputMessage] = useState('');
  const [code, setCode] = useState(EMPTY_CODE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [codeHasChanged, setCodeHasChanged] = useState(true);
  const [codeNeedsReload, setCodeNeedsReload] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [codeSyntax, setCodeSyntax] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishingLoading, setIsPublishingLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccessLink, setPublishSuccessLink] = useState<string | null>(null);
  const [publishedGame, setPublishedGame] = useState<{ id: string; slug: string } | null>(null);

  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);
  const defaultCode = useRef(EMPTY_CODE);
  const lastError = useRef('');
  const reportedError = useRef(false);

  const handleTranscription = (text: string) => {
    setInputMessage((prev) => prev + text);
  };

  const updateCodeSyntax = useCallback(async (newCode: string) => {
    const highlighted = await marked.parse('```javascript\n' + newCode + '\n```');
    setCodeSyntax(highlighted);
  }, []);

  const runCode = useCallback((codeToRun: string, executionMethod: 'auto' | 'manual' | 'reload' = 'auto') => {
    reportedError.current = false;
    lastError.current = '';

    // Track code execution
    posthog?.capture(POSTHOG_EVENTS.CODE_EXECUTED, {
      [POSTHOG_PROPERTIES.CODE_LENGTH]: codeToRun.length,
      [POSTHOG_PROPERTIES.EXECUTION_METHOD]: executionMethod,
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>p5.js Sketch</title>
          <style>
              body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: transparent; }
              main { display: flex; justify-content: center; align-items: center; }
              .console { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0, 0, 0, 0.7); padding: 1em; margin: 0; color: red; font-family: monospace;}
          </style>
          <script src="${p5jsCdnUrl}"></script>
          <script>
            window.addEventListener('message', (event) => {
                if (event.data === 'stop' && typeof noLoop === 'function') { noLoop(); console.log('Sketch stopped (noLoop)'); }
                else if (event.data === 'resume' && typeof loop === 'function') { loop(); console.log('Sketch resumed (loop)'); }
            }, false);
          </script>
      </head>
      <body>
          <script>
              try {
                  ${codeToRun}
              } catch (error) {
                  console.error("Error in sketch:", error);
                  parent.postMessage(JSON.stringify({ message: error.toString() }), '*');
                  document.body.innerHTML = '<pre class="console">Error: ' + error.message + '\\nCheck the browser console for details or ask the AI to fix it.</pre>';
              }
          </script>
      </body>
      </html>
    `;
    if (previewFrameRef.current) {
        previewFrameRef.current.setAttribute('srcdoc', htmlContent);
    }
    setCodeNeedsReload(false);
  }, [posthog]);
  
  const scrollToTheEnd = () => {
    setTimeout(() => {
      anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };
  
  const addMessage = useCallback((role: string, explanation: string, thinking?: string): number => {
    const id = nextId.current++;
    setMessages(prev => [...prev, { id, role, explanation, thinking }]);
    setTimeout(scrollToTheEnd, 100);
    return id;
  }, []);

  const runtimeErrorHandler = useCallback((errorMessage: string) => {
    reportedError.current = true;
    if (lastError.current !== errorMessage) {
      addMessage('system-ask', errorMessage);
      
      // Track runtime error
      posthog?.capture(POSTHOG_EVENTS.RUNTIME_ERROR, {
        [POSTHOG_PROPERTIES.ERROR_TYPE]: 'runtime',
        error_message: errorMessage,
      });
    }
    lastError.current = errorMessage;
  }, [addMessage, posthog]);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
        if (event.data && typeof event.data === 'string') {
            try {
              const message = JSON.parse(event.data).message;
              if(message) runtimeErrorHandler(message);
            } catch (e) {
                // Not a JSON message, ignore.
            }
          }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [runtimeErrorHandler]);

  const sendMessageAction = useCallback(async (messageText?: string, role: string = 'user') => {
    if (chatState !== ChatState.IDLE) return;
    
    const msg = (messageText || inputMessage).trim();
    if (!msg) return;

    setChatState(ChatState.GENERATING);
    if (!messageText) {
      setInputMessage('');
    }
    if(role.toLowerCase() === 'user'){
      addMessage('user', msg);
    }

    let fullMessage = msg;
    if(codeHasChanged) {
      fullMessage += '\n\nHere is the current code:\n```javascript\n' + code + '\n```';
      setCodeHasChanged(false);
    }
    if (role.toLowerCase() === 'system') {
      fullMessage = `Interpreter reported: ${msg}. Is it possible to improve that?`;
    }

    // Track AI message sent
    posthog?.capture(POSTHOG_EVENTS.AI_MESSAGE_SENT, {
      [POSTHOG_PROPERTIES.MESSAGE_LENGTH]: msg.length,
      [POSTHOG_PROPERTIES.HAS_CODE_CONTEXT]: codeHasChanged,
      message_role: role.toLowerCase(),
    });

    const currentMessageId = addMessage('assistant', '', '');
    setMessages(prev => prev.map(m => m.id === currentMessageId ? { ...m, explanation: '...' } : m));

    try {
      // Direct call to Gemini API
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: fullMessage,
          systemInstructions: SYSTEM_INSTRUCTIONS,
          conversationHistory: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.explanation
          })),
          currentCode: code
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages(prev => prev.map(msg => 
          msg.id === currentMessageId 
            ? { ...msg, explanation: accumulatedText, isGeneratingCode: false }
            : msg
        ));
        scrollToTheEnd();
      }

      const text = accumulatedText;
      const p5CodeMatch = text.match(/```javascript\n([\s\S]*?)\n```/);
      const p5Code = p5CodeMatch ? p5CodeMatch[1] : null;
      let finalExplanation = text;

      if (p5CodeMatch) {
        finalExplanation = text.replace(p5CodeMatch[0], '').trim();
      }

      if (p5Code && p5Code.trim().length > 0) {
        setCode(p5Code);
        updateCodeSyntax(p5Code);
        runCode(p5Code, 'auto');
        if (!finalExplanation) {
          finalExplanation = "Done. The code has been updated.";
        }
      } else if(!text.trim()) {
        finalExplanation = 'There is no new code update.';
      }

      // Final update to the message with only the explanation
      setMessages(prev => prev.map(m =>
        m.id === currentMessageId
          ? { ...m, explanation: finalExplanation, code: p5Code ?? undefined, isGeneratingCode: false }
          : m
      ));

    } catch (e: any) {
      console.error('AI API Error:', e);
      addMessage('error', e.message || 'An error occurred.');
    } finally {
      setChatState(ChatState.IDLE);
    }

  }, [chatState, inputMessage, addMessage, code, codeHasChanged, runCode, updateCodeSyntax, messages, posthog, scrollToTheEnd]);

  // Initial page load effect - only runs once
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    const editSlug = urlParams.get('edit');
    
    if (q) {
      sendMessageAction(q);
    }
    
    // Load game for editing if edit parameter is present
    if (editSlug && authenticated) {
      loadGameFromSlug(editSlug);
    } else {
      setCode(EMPTY_CODE);
      updateCodeSyntax(EMPTY_CODE);
      runCode(EMPTY_CODE);
    }
  }, []); // Empty dependency array - only runs on mount

  const loadGameFromSlug = async (slug: string) => {
    try {
      const response = await fetch(`/api/games/${slug}`);
      if (response.ok) {
        const game = await response.json();
        setCode(game.code);
        updateCodeSyntax(game.code);
        runCode(game.code);
        setPublishedGame({ id: game.id, slug: game.slug });
        setSelectedChatTab(ChatTab.CODE);
        setCodeHasChanged(true);
        addMessage('system', `Loaded "${game.name}" for editing. You can now modify the code and republish.`);
      }
    } catch (error) {
      console.error('Error loading game for editing:', error);
      addMessage('error', 'Failed to load game for editing.');
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (chatState !== ChatState.IDLE) return;
    setCode(newCode);
    setCodeHasChanged(true);
    setCodeNeedsReload(true);
    updateCodeSyntax(newCode);
    
    // Track manual code edit
    posthog?.capture(POSTHOG_EVENTS.CODE_MANUALLY_EDITED, {
      [POSTHOG_PROPERTIES.CODE_LENGTH]: newCode.length,
    });
  };
  
  const resetAction = () => {
    setCode(defaultCode.current);
    updateCodeSyntax(defaultCode.current);
    runCode(defaultCode.current, 'reload');
    setMessages([]);
    setCodeHasChanged(true);
    setPublishedGame(null);
    
    // Track game reset
    posthog?.capture(POSTHOG_EVENTS.GAME_RESET, {
      had_published_game: !!publishedGame,
    });
  };

  const handlePublish = async (name: string, slug: string, description: string, author: string) => {
    setIsPublishingLoading(true);
    setPublishError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const url = publishedGame ? `/api/games/${publishedGame.slug}` : '/api/games';
      const method = publishedGame ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, slug, description, code, author }),
      });

      const game = await response.json();

      if (!response.ok) {
        throw new Error(game.error || 'Failed to publish');
      }
      
      setPublishedGame(game);
      const successLink = `/c/games/${game.slug}`;
      setPublishSuccessLink(successLink);
      const successMessage = `Game ${publishedGame ? 'updated' : 'published'} successfully! You can view it <a href="${successLink}" target="_blank" rel="noopener noreferrer" class="publish-link">here</a>.`;
      addMessage('system', successMessage);

      // Track game publish/update
      posthog?.capture(publishedGame ? POSTHOG_EVENTS.GAME_UPDATED : POSTHOG_EVENTS.GAME_PUBLISHED, {
        [POSTHOG_PROPERTIES.GAME_SLUG]: game.slug,
        game_name: name,
        [POSTHOG_PROPERTIES.CODE_LENGTH]: code.length,
        has_description: !!description,
        has_author: !!author,
      });

    } catch (error) {
        setPublishError((error as Error).message);
    } finally {
        setIsPublishingLoading(false);
    }
  };

  const closePublishModal = () => {
    setIsPublishing(false);
    setPublishError(null);
    setPublishSuccessLink(null);
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      {/* Main Navigation Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image src="/icon.webp" alt="Gamenzo" width={32} height={32} className="rounded-lg" />
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  Enzo AI Game Maker
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/platform/my-games" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">My Games</span>
              </Link>
              
              {authenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-2 text-sm bg-muted/50 rounded-lg px-3 py-1.5">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs font-semibold">
                        {(user?.email?.address?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-muted-foreground max-w-[120px] truncate">
                      {user?.email?.address || 'User'}
                    </span>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={login}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={login}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-96 bg-card/50 backdrop-blur-sm border-r border-border flex flex-col h-full overflow-hidden">
          {/* Tab Selector */}
          <div className="flex border-b border-border flex-shrink-0 bg-muted/20">
            <button
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all relative ${
                selectedChatTab === ChatTab.AI_CHAT
                  ? 'text-primary bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => setSelectedChatTab(ChatTab.AI_CHAT)}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enzo AI</span>
              {selectedChatTab === ChatTab.AI_CHAT && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
            <button
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all relative ${
                selectedChatTab === ChatTab.CODE
                  ? 'text-primary bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => setSelectedChatTab(ChatTab.CODE)}
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
              {codeHasChanged && <div className="w-2 h-2 bg-destructive rounded-full absolute -top-1 -right-1"></div>}
              {selectedChatTab === ChatTab.CODE && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          </div>

          {/* AI Chat Tab */}
          {selectedChatTab === ChatTab.AI_CHAT && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Chat Messages - No Model Selector */}
              <ScrollArea className="flex-1 px-4 min-h-0">
                <div className="space-y-4 py-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground'
                          : msg.role === 'error'
                          ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                          : msg.role === 'system'
                          ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {msg.thinking && (
                          <details className="mb-2 text-sm opacity-70">
                            <summary className="cursor-pointer">Thinking...</summary>
                            <div className="mt-2 pl-2 border-l-2 border-border">
                              <MemoizedMarkdown content={msg.thinking} />
                            </div>
                          </details>
                        )}
                        <div className="text-sm">
                          <MemoizedMarkdown content={msg.explanation} />
                        </div>
                        {msg.isGeneratingCode && (
                          <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="animate-spin w-4 h-4 border-2 border-border border-t-primary rounded-full"></div>
                              <span>Generating code...</span>
                            </div>
                          </div>
                        )}
                        {msg.code && !msg.isGeneratingCode && (
                          <button 
                            onClick={() => setSelectedChatTab(ChatTab.CODE)}
                            className="mt-2 w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <div className="flex items-center space-x-2 text-sm text-foreground font-medium">
                               <Code className="w-4 h-4" />
                               <span>Code generated ({msg.code.split('\n').length} lines)</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Click to view and edit.</p>
                          </button>
                        )}
                        {msg.role === 'system-ask' && (
                          <button 
                            onClick={() => sendMessageAction(msg.explanation, 'SYSTEM')}
                            className="mt-2 px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-xs transition-colors"
                          >
                            Improve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={anchorRef}></div>
                </div>
              </ScrollArea>

              {/* Chat Status */}
              {chatState !== ChatState.IDLE && (
                <div className="px-4 py-2 bg-muted/20 border-t border-border flex-shrink-0">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-border border-t-primary rounded-full"></div>
                    <span>
                      {chatState === ChatState.GENERATING && 'Generating...'}
                      {chatState === ChatState.THINKING && 'Thinking...'}
                      {chatState === ChatState.CODING && 'Coding...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                    placeholder="Describe what you want to create or change..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessageAction()}
                    disabled={chatState !== ChatState.IDLE}
                  />
                  <MicInput onTranscription={handleTranscription} />
                  <button
                    className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => sendMessageAction()}
                    disabled={chatState !== ChatState.IDLE}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                      <path d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Code Tab */}
          {selectedChatTab === ChatTab.CODE && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 p-4 min-h-0">
                <div className="relative h-full rounded-lg border border-border bg-muted/20">
                  <div 
                    className="absolute inset-0 p-4 text-sm font-mono opacity-50 pointer-events-none overflow-auto"
                    dangerouslySetInnerHTML={{ __html: codeSyntax }}
                    ref={(el) => {
                      if (el && textareaRef.current) {
                        el.scrollTop = textareaRef.current.scrollTop;
                        el.scrollLeft = textareaRef.current.scrollLeft;
                      }
                    }}
                  />
                  <textarea
                    ref={textareaRef}
                    className="absolute inset-0 w-full h-full bg-transparent text-foreground p-4 text-sm font-mono resize-none focus:outline-none border-0 overflow-auto"
                    value={code}
                    readOnly={chatState !== ChatState.IDLE}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onScroll={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      const overlay = target.previousElementSibling as HTMLElement;
                      if (overlay) {
                        overlay.scrollTop = target.scrollTop;
                        overlay.scrollLeft = target.scrollLeft;
                      }
                    }}
                    style={{ color: 'transparent', caretColor: 'hsl(var(--foreground))' }}
                    placeholder="// Your p5.js code will appear here..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Secondary Status Bar */}
          <div className="bg-card/50 backdrop-blur-sm border-b border-border px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {authenticated ? (
                  <button 
                    onClick={() => setIsPublishing(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{publishedGame ? 'Update Game' : 'Publish Game'}</span>
                  </button>
                ) : (
                  <button 
                    onClick={login}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Sign In to Publish</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => runCode(code, 'reload')} 
                  title="Reload Code"
                  className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={resetAction}
                  title="Clear All"
                  className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="flex-1 relative bg-muted/10 min-h-0">
            <iframe 
              ref={previewFrameRef} 
              className="w-full h-full border-0" 
              title="p5.js Preview" 
              allowTransparency={true} 
            />
            
            {/* Floating Game Controls */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button 
                className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                  isRunning 
                    ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive' 
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed'
                }`}
                onClick={() => { setIsRunning(false); previewFrameRef.current?.contentWindow?.postMessage('stop', '*'); }}
                disabled={!isRunning}
                title="Stop Game"
              >
                <Square className="w-5 h-5" />
              </button>
              <button 
                className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                  !isRunning 
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-600' 
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed'
                }`}
                onClick={() => { setIsRunning(true); previewFrameRef.current?.contentWindow?.postMessage('resume', '*'); }}
                disabled={isRunning}
                title="Play Game"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {isPublishing && (
        <PublishModal
          onClose={closePublishModal}
          onPublish={handlePublish}
          isLoading={isPublishingLoading}
          error={publishError}
          successLink={publishSuccessLink}
          existingGame={publishedGame}
        />
      )}
    </div>
  );
}

function PublishModal({ 
  onClose, 
  onPublish, 
  isLoading, 
  error, 
  successLink, 
  existingGame 
}: { 
  onClose: () => void; 
  onPublish: (name: string, slug: string, description: string, author: string) => void; 
  isLoading: boolean; 
  error: string | null; 
  successLink: string | null;
  existingGame?: { id: string; slug: string } | null;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');

  const isEditing = !!existingGame;

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    setSlug(newSlug);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-foreground mb-6">
          {isEditing ? 'Update Game' : 'Publish New Game'}
        </h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Game Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          
          <div>
            <input
              type="text"
              placeholder="URL Slug (e.g., my-awesome-game)"
              value={slug}
              onChange={handleSlugChange}
              disabled={isEditing}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-1">
                Note: You can't change the URL slug when updating an existing game.
              </p>
            )}
          </div>
          
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
          
          <input
            type="text"
            placeholder="Author (Optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onPublish(name, slug, description, author)} 
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update Game' : 'Publish Game')}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {successLink && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-2">
              {isEditing ? 'Game Updated' : 'Game Published'}! 🎉
            </p>
            <a 
              href={successLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-200 text-sm underline flex items-center space-x-1"
            >
              <span>{window.location.origin}{successLink}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 