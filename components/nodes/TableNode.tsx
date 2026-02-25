'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GripVertical, Key, Link, Trash2 } from 'lucide-react';
import { TableData } from '@/types/database';
import { useStore } from '@/store/useStore';

function TableNodeComponent({ id, data }: NodeProps) {
  const tableData = data as unknown as TableData;
  const { setSelectedNode, searchQuery, removeColumn } = useStore();

  const isMatch = searchQuery
    ? tableData.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tableData.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  const opacity = searchQuery ? (isMatch ? 1 : 0.2) : 1;
  const highlightBorder = searchQuery && isMatch ? '1px solid var(--accent)' : '1px solid var(--border)';

  return (
    <div
      className="table-node"
      onClick={() => setSelectedNode(id)}
      style={{ opacity, border: highlightBorder, transition: 'all 0.2s', filter: searchQuery && isMatch ? 'drop-shadow(0 0 12px rgba(255,255,255,0.1))' : 'none' }}
    >
      <div className="table-header" style={{ backgroundColor: tableData.color }}>
        <GripVertical size={14} className="opacity-50" />
        <span className="table-title">{tableData.label}</span>
      </div>

      <div className="table-body">
        {tableData.columns.map((col) => (
          <div key={col.id} className="table-row" style={{ position: 'relative' }}>
            <Handle
              type="target"
              position={Position.Left}
              id={col.name}
              className="handle-dot-left"
            />

            <div className="col-info">
              {col.isPrimaryKey && <Key size={12} className="text-amber-400" />}
              {col.isForeignKey && <Link size={12} className="text-blue-400" />}
              <span className="col-name">{col.name}</span>
            </div>
            <div className="col-meta">
              <span className="col-type">{col.type}</span>
              {!col.isNullable && <span className="col-nn">NN</span>}
            </div>

            <Handle
              type="source"
              position={Position.Right}
              id={col.name}
              className="handle-dot-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const TableNode = memo(TableNodeComponent);
