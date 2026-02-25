'use client';
import { useRef } from 'react';
import { Search, Download, Upload, FileCode, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generateSQL } from '@/utils/sqlGenerator';

export default function Toolbar() {
  const { nodes, edges, exportDiagram, importDiagram, clearDiagram, searchQuery, setSearchQuery } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportDiagram();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nxgraph-diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importDiagram(data);
      } catch {
        alert('Invalid JSON file!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGenerateSQL = () => {
    const sql = generateSQL(nodes, edges);
    navigator.clipboard.writeText(sql);
    alert('SQL copied to clipboard!');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button onClick={handleExport} className="toolbar-btn" title="Export JSON">
          <Download size={16} /> Export
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="toolbar-btn" title="Import JSON">
          <Upload size={16} /> Import
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} hidden />
        <button onClick={handleGenerateSQL} className="toolbar-btn" title="Generate SQL">
          <FileCode size={16} /> SQL
        </button>
        <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 8px' }}>
          <Search size={14} className="text-secondary" style={{ opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search Canvas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              padding: '6px 8px',
              width: '180px'
            }}
          />
        </div>
      </div>
      <div className="toolbar-group">
        <button onClick={clearDiagram} className="toolbar-btn danger" title="Clear All">
          <Trash2 size={16} /> Clear
        </button>
      </div>
    </div>
  );
}
