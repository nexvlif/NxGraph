'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Wand2 } from 'lucide-react';
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
  const { loadFromParsedDBML } = useStore();
  const monaco = useMonaco();

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

  return (
    <aside className="editor-panel">
      <div className="editor-header">
        <h3>NxGraph</h3>
        <button className="btn-secondary" style={{ width: 'auto', padding: '4px 8px' }} onClick={handleFormat}>
          <Wand2 size={14} /> Format
        </button>
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
    </aside>
  );
}
