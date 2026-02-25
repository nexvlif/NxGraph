'use client';

import { Settings2, Key, Link as LinkIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TableData, RelationData } from '@/types/database';

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
                    {col.isPrimaryKey && <Key size={12} className="text-amber-400" />}
                    {col.isForeignKey && <LinkIcon size={12} className="text-blue-400" />}
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
                  const isSource = edge.source === selectedNode;
                  const otherNodeId = isSource ? edge.target : edge.source;
                  const otherNodeName = nodes.find(n => n.id === otherNodeId)?.data?.label || 'Unknown';

                  return (
                    <div key={edge.id} className="relation-item">
                      <div className="rel-header">
                        <span className="rel-type badge badge-rel">{data?.relationType || 'one-to-many'}</span>
                      </div>
                      <div className="rel-path">
                        <span>{isSource ? data?.sourceColumn : data?.targetColumn}</span>
                        <LinkIcon size={10} className="mx-1 opacity-50" />
                        <span>{otherNodeName}.{isSource ? data?.targetColumn : data?.sourceColumn}</span>
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
