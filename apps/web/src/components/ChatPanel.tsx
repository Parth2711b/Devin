import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Terminal, Code, ChevronRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import type { Message } from '../api/client';

interface ChatPanelProps {
  messages: Message[];
  isAgentRunning: boolean;
  onSendPrompt: (prompt: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isAgentRunning,
  onSendPrompt,
}) => {
  const [prompt, setPrompt] = useState('');
  const [expandedTrace, setExpandedTrace] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentRunning]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isAgentRunning) return;
    onSendPrompt(prompt.trim());
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTrace = (id: string) => {
    setExpandedTrace((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const samplePrompts = [
    'Write a Fibonacci generator with benchmark tests',
    'Create an Express server with /health and /items endpoints',
    'Write a CLI calculator in Node.js and verify it with tests',
  ];

  return (
    <div className="chat-panel">
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-icon-wrap">
              <Bot size={40} className="empty-icon" />
            </div>
            <h3>What should we build today?</h3>
            <p>
              I can inspect code, write modules, execute terminal commands, run tests, and fix bugs autonomously.
            </p>

            <div className="sample-prompts-grid">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  className="sample-prompt-chip"
                  onClick={() => onSendPrompt(sample)}
                  disabled={isAgentRunning}
                >
                  <Sparkles size={14} className="chip-icon" />
                  <span>{sample}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => {
              const isUser = msg.role === 'USER';
              const hasTrace =
                msg.rawTrace &&
                ((msg.rawTrace.toolCalls && msg.rawTrace.toolCalls.length > 0) ||
                  (msg.rawTrace.toolResults && msg.rawTrace.toolResults.length > 0));
              const isExpanded = expandedTrace[msg.id] ?? false;

              return (
                <div key={msg.id} className={`message-item message-${msg.role.toLowerCase()}`}>
                  <div className="message-header">
                    <div className="message-author">
                      <div className={`avatar-icon avatar-${msg.role.toLowerCase()}`}>
                        {isUser ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <span className="author-name">{isUser ? 'You' : 'Devin'}</span>
                    </div>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="message-body">
                    <div className="message-text">
                      {msg.summaryText.split('\n').map((line, i) => (
                        <p key={i}>{line || '\u00A0'}</p>
                      ))}
                    </div>

                    {hasTrace && (
                      <div className="trace-accordion">
                        <button className="trace-toggle-btn" onClick={() => toggleTrace(msg.id)}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <Terminal size={14} />
                          <span>Tool Actions ({msg.rawTrace?.toolCalls?.length || 0})</span>
                        </button>

                        {isExpanded && (
                          <div className="trace-details">
                            {msg.rawTrace?.toolCalls?.map((call: any, idx: number) => (
                              <div key={idx} className="tool-call-block">
                                <div className="tool-call-header">
                                  <Code size={13} />
                                  <span className="tool-name">{call.toolName || 'tool'}</span>
                                </div>
                                <pre className="tool-args">{JSON.stringify(call.args, null, 2)}</pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAgentRunning && (
              <div className="message-item message-agent running-bubble">
                <div className="message-header">
                  <div className="message-author">
                    <div className="avatar-icon avatar-agent">
                      <Bot size={14} />
                    </div>
                    <span className="author-name">Devin</span>
                  </div>
                </div>
                <div className="running-indicator-content">
                  <Loader2 size={16} className="animate-spin text-emerald" />
                  <span>Devin is thinking, writing code, and running sandbox tests...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAgentRunning
                ? 'Devin is actively running tasks...'
                : 'Ask Devin to build a feature, write tests, or fix a bug... (Enter to send)'
            }
            disabled={isAgentRunning}
            rows={2}
          />

          <div className="input-actions-bar">
            <span className="shortcut-hint">Press ↵ to send, Shift+↵ for new line</span>
            <button
              type="submit"
              className="btn-send"
              disabled={!prompt.trim() || isAgentRunning}
              title="Send to Devin"
            >
              {isAgentRunning ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{isAgentRunning ? 'Working...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
