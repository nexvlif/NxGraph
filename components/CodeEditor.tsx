'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Wand2, Sparkles, Loader2, Send, Bot, User } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useStore } from '@/store/useStore';
import { parseDBML } from '@/utils/dbmlParser';

const DEFAULT_DBML = `Table users {
  id integer [primary key]
  username varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  user_id integer [ref: > users.id]
  body text
}

Table profile {
  id integer [primary key]
  user_id integer [unique, ref: - users.id]
  bio varchar
}
`;

export default function CodeEditor() {
  const [code, setCode] = useState(DEFAULT_DBML);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
  const [panelWidth, setPanelWidth] = useState(320);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const { loadFromParsedDBML } = useStore();
  const monaco = useMonaco();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isGenerating]);

  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'dbml' });
      monaco.languages.setMonarchTokensProvider('dbml', {
        tokenizer: {
          root: [
            [/\b(Table|table)\b/, 'keyword'],
            [/\[.*?\]/, 'annotation'],
            [/\b(primary key|unique|not null|ref|pk|null)\b/i, 'keyword.control'],
          ]
        }
      });
      monaco.editor.defineTheme('nxgraph-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '569CD6' },
          { token: 'annotation', foreground: 'C586C0' },
          { token: 'keyword.control', foreground: 'C586C0' }
        ],
        colors: {
          'editor.background': '#000000',
          'editor.lineHighlightBackground': '#111111',
        }
      });
    }
  }, [monaco]);

  useEffect(() => {
    try {
      const parsed = parseDBML(code);
      loadFromParsedDBML(parsed.tables, parsed.relations);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Parse error");
    }
  }, [code, loadFromParsedDBML]);

  const handleFormat = () => {
    const lines = code.split('\n');
    const formatted = lines.map(line => {
      let l = line.trim();
      if (l.toLowerCase().startsWith('table')) return l;
      if (l === '}' || l === '') return l;
      return '  ' + l.replace(/\s+/g, ' ');
    }).join('\n');
    setCode(formatted);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMessage = aiPrompt.trim();
    setAiPrompt('');
    setIsGenerating(true);
    setError(null);

    let currentMessages = [...chatHistory];

    if (currentMessages.length === 0) {
      currentMessages.push({
        role: 'user',
        content: `Here is the current DBML schema I am working on:\n\`\`\`dbml\n${code}\n\`\`\`\n\nUser Request: ${userMessage}`
      });
    } else {
      currentMessages.push({ role: 'user', content: userMessage });
    }

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate DBML');
      }

      const generatedDBML = data.dbml;
      setCode(generatedDBML);

      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: "I've successfully updated your database schema." }
      ]);

    } catch (err: any) {
      setError(err.message);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setAiPrompt(text);
  };

  return (
    <>
      {showPromptModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowPromptModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              height: '75vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              position: 'relative',
              zIndex: 10,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              flexShrink: 0,
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(237,237,237,0.15), rgba(237,237,237,0.05))',
                border: '1px solid rgba(237,237,237,0.1)',
              }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>NxGraph AI</h3>
                <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-secondary)' }}>Build & modify your schema with AI</p>
              </div>
              <button
                type="button"
                onClick={() => setChatHistory([])}
                style={{
                  padding: '5px 10px',
                  fontSize: '11px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {chatHistory.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}>
                    <Bot size={24} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>How can I help?</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                      Describe the tables, columns, or relationships you want and I'll generate the DBML code.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                    {['Add a comments table', 'Add user roles', 'Create an e-commerce schema'].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestion(suggestion)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    width: '100%',
                    gap: '10px',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                    }}>
                      {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                    </div>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      maxWidth: '78%',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      wordBreak: 'break-word' as const,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                      borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div style={{ display: 'flex', width: '100%', gap: '10px', flexDirection: 'row' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    flexShrink: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}>
                    <Bot size={13} />
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    borderBottomLeftRadius: '4px',
                  }}>
                    <Loader2 size={12} className="animate-spin" /> Thinking & Coding...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleGenerate} style={{
              display: 'flex',
              gap: '8px',
              flexShrink: 0,
              padding: '16px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
            }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                disabled={isGenerating}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '13px',
                  fontWeight: 400,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  opacity: isGenerating ? 0.5 : 1,
                  boxSizing: 'border-box' as const,
                  minWidth: 0,
                }}
                autoFocus
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || isGenerating}
                style={{
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  padding: 0,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (!aiPrompt.trim() || isGenerating) ? 'var(--bg-tertiary)' : 'var(--accent)',
                  color: (!aiPrompt.trim() || isGenerating) ? 'var(--text-secondary)' : 'var(--accent-text)',
                  border: '1px solid',
                  borderColor: (!aiPrompt.trim() || isGenerating) ? 'var(--border)' : 'var(--accent)',
                  cursor: (!aiPrompt.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      <aside className="editor-panel" style={{ width: panelWidth, minWidth: panelWidth, position: 'relative' }}>
        <div className="editor-header">
          <h3>NxGraph</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ width: 'auto', padding: '4px 8px' }} onClick={() => setShowPromptModal(true)} disabled={isGenerating}>
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isGenerating ? 'Generating...' : 'AI Gen'}
            </button>
            <button className="btn-secondary" style={{ width: 'auto', padding: '4px 8px' }} onClick={handleFormat}>
              <Wand2 size={14} /> Format
            </button>
          </div>
        </div>
        <div className="editor-container">
          <Editor
            height="100%"
            language="dbml"
            theme="vs-dark"
            loading={<div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Loading Editor...</div>}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
            onMount={(editor, monaco) => {
              monaco.editor.setTheme('nxgraph-dark');
            }}
          />
          {error && (
            <div className="editor-error">
              <AlertCircle size={14} className="error-icon" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '4px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 20,
            background: 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          onMouseLeave={(e) => { if (!isResizing.current) e.currentTarget.style.background = 'transparent'; }}
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
            const startX = e.clientX;
            const startWidth = panelWidth;
            const handle = e.currentTarget;
            handle.style.background = 'var(--accent)';

            const onMouseMove = (ev: MouseEvent) => {
              const delta = ev.clientX - startX;
              const newWidth = Math.min(600, Math.max(240, startWidth + delta));
              setPanelWidth(newWidth);
            };
            const onMouseUp = () => {
              isResizing.current = false;
              handle.style.background = 'transparent';
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />
      </aside>
    </>
  );
}
