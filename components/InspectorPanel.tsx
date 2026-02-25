'use client';

import { Settings2, Key, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TableData, RelationData } from '@/types/database';

function getRelationLabel(relType: string) {
  if (relType === 'one-to-one') return '1 : 1';
  if (relType === 'many-to-many') return 'N : M';
  return '1 : N';
}

function getRelationRole(relType: string, isSource: boolean) {
  if (relType === 'one-to-one') return 'ONE';
  if (relType === 'many-to-many') return 'MANY';
  return isSource ? 'MANY' : 'ONE';
}

function getRoleBadgeStyle(role: string) {
  if (role === 'ONE') {
    return {
      background: 'rgba(34,197,94,0.1)',
      color: '#4ade80',
      border: '1px solid rgba(34,197,94,0.2)',
    };
  }
  return {
    background: 'rgba(99,102,241,0.1)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.2)',
  };
}

export default function InspectorPanel() {
  const { nodes, edges, selectedNode } = useStore();

  const activeNode = nodes.find((n) => n.id === selectedNode);
  const tableData = activeNode?.data as unknown as TableData;

  const activeEdges = edges.filter(
    (e) => e.source === selectedNode || e.target === selectedNode
  );

  return (
    <aside className="inspector-panel">
      <div className="inspector-header">
        <Settings2 size={16} />
        <h3>Properties</h3>
      </div>

      {!activeNode ? (
        <div className="inspector-empty">
          <p>Select a table on the canvas to view its properties and relationships.</p>
        </div>
      ) : (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-label">Table Name</div>
            <div className="table-name-badge" style={{ borderLeftColor: tableData.color }}>
              {tableData.label}
            </div>
          </div>

          <div className="inspector-section">
            <div className="section-label">Columns</div>
            <div className="columns-list">
              {tableData.columns.map((col) => (
                <div key={col.id} className="inspector-col">
                  <div className="col-name-row">
                    {col.isPrimaryKey && <Key size={12} style={{ color: '#fbbf24' }} />}
                    {col.isForeignKey && <LinkIcon size={12} style={{ color: '#60a5fa' }} />}
                    <span className="col-name">{col.name}</span>
                  </div>
                  <div className="col-details">
                    <span className="col-type">{col.type}</span>
                    <div className="col-flags">
                      {col.isPrimaryKey && <span className="badge badge-pk">PK</span>}
                      {col.isUnique && !col.isPrimaryKey && <span className="badge badge-uk">UNIQUE</span>}
                      {!col.isNullable && <span className="badge badge-nn">NOT NULL</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeEdges.length > 0 && (
            <div className="inspector-section">
              <div className="section-label">Relations</div>
              <div className="relations-list">
                {activeEdges.map((edge) => {
                  const data = edge.data as unknown as RelationData;
                  const relationType = data?.relationType || 'one-to-many';
                  const isSource = edge.source === selectedNode;
                  const otherNodeId = isSource ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherNodeId);
                  const otherNodeData = otherNode?.data as unknown as TableData;
                  const otherNodeName = otherNodeData?.label || 'Unknown';

                  const thisRole = getRelationRole(relationType, isSource);
                  const otherRole = getRelationRole(relationType, !isSource);
                  const thisCol = isSource ? data?.sourceColumn : data?.targetColumn;
                  const otherCol = isSource ? data?.targetColumn : data?.sourceColumn;
                  const roleBadgeThis = getRoleBadgeStyle(thisRole);
                  const roleBadgeOther = getRoleBadgeStyle(otherRole);

                  return (
                    <div key={edge.id} className="relation-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span className="badge badge-rel">{getRelationLabel(relationType)}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge" style={{ ...roleBadgeThis, padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>{thisRole}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{tableData.label}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>. {thisCol}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '8px' }}>
                          <ArrowRight size={10} style={{ color: 'var(--text-secondary)' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge" style={{ ...roleBadgeOther, padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>{otherRole}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{otherNodeName}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>. {otherCol}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
