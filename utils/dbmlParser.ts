import { nanoid } from 'nanoid';
import dagre from 'dagre';
import { Column, RelationData, RelationType, TableData } from '@/types/database';

export interface ParsedDiagram {
  tables: { id: string; data: TableData; position: { x: number; y: number } }[];
  relations: { id: string; source: string; target: string; data: RelationData }[];
}

export function parseDBML(text: string): ParsedDiagram {
  const tables: ParsedDiagram['tables'] = [];
  const relations: ParsedDiagram['relations'] = [];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let currentTable: { id: string; label: string; columns: Column[] } | null = null;

  for (const line of lines) {
    if (line.toLowerCase().startsWith('table ') && line.includes('{')) {
      const match = line.match(/^table\s+([a-zA-Z0-9_]+)\s*\{/i);
      if (match) {
        currentTable = {
          id: `table-${nanoid(8)}`,
          label: match[1],
          columns: [],
        };
        tables.push({
          id: currentTable.id,
          data: {
            label: currentTable.label,
            columns: currentTable.columns,
            color: '#0078D4',
          },
          position: { x: 0, y: 0 },
        });
      }
    } else if (line === '}') {
      currentTable = null;
    } else if (currentTable && !line.startsWith('//')) {
      const parts = line.split(/\s+/);
      const name = parts[0];
      let type = parts[1] || 'VARCHAR(255)';

      const isPK = line.toLowerCase().includes('[primary key]') || line.toLowerCase().includes('pk');
      const isUnique = line.toLowerCase().includes('[unique]');
      const isNullable = !line.toLowerCase().includes('[not null]');

      const newColumn: Column = {
        id: nanoid(8),
        name,
        type: type.toUpperCase(),
        isPrimaryKey: isPK,
        isForeignKey: false,
        isNullable: isNullable,
        isUnique: isUnique || isPK,
        defaultValue: '',
      };

      currentTable.columns.push(newColumn);

      const refMatch = line.match(/\[ref:\s*([><-])\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\]/i);
      if (refMatch) {
        const symbol = refMatch[1];
        const targetTableName = refMatch[2];
        const targetColumnName = refMatch[3];

        let relType: RelationType = 'one-to-many';
        if (symbol === '-') relType = 'one-to-one';

        newColumn.isForeignKey = true;

        (newColumn as any)._pendingRefTarget = { tableName: targetTableName, columnName: targetColumnName, relType };
      }
    }
  }

  for (const table of tables) {
    for (const col of table.data.columns) {
      if ((col as any)._pendingRefTarget) {
        const targetInfo = (col as any)._pendingRefTarget;
        const targetTable = tables.find(t => t.data.label.toLowerCase() === targetInfo.tableName.toLowerCase());

        if (targetTable) {
          relations.push({
            id: `edge-${nanoid(8)}`,
            source: table.id,
            target: targetTable.id,
            data: {
              relationType: targetInfo.relType,
              sourceColumn: col.name,
              targetColumn: targetInfo.columnName
            }
          });
        }
        delete (col as any)._pendingRefTarget;
      }
    }
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 100, edgesep: 50, ranksep: 200 });
  g.setDefaultEdgeLabel(() => ({}));

  tables.forEach((t) => {
    const height = 50 + (t.data.columns.length * 30);
    g.setNode(t.id, { width: 250, height });
  });

  relations.forEach((r) => {
    g.setEdge(r.source, r.target);
  });

  dagre.layout(g);

  tables.forEach((t) => {
    const nodeWithPosition = g.node(t.id);
    t.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };
  });

  return { tables, relations };
}
