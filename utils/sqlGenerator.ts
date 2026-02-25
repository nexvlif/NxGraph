import { Node, Edge } from '@xyflow/react';
import { TableData } from '@/types/database';

export function generateSQL(nodes: Node<TableData>[], edges: Edge[]): string {
  const statements: string[] = [];

  for (const node of nodes) {
    const table = node.data;
    const lines: string[] = [];
    const primaryKeys: string[] = [];

    for (const col of table.columns) {
      let line = `  ${col.name} ${col.type}`;
      if (!col.isNullable) line += ' NOT NULL';
      if (col.isUnique && !col.isPrimaryKey) line += ' UNIQUE';
      if (col.defaultValue) line += ` DEFAULT ${col.defaultValue}`;
      lines.push(line);

      if (col.isPrimaryKey) primaryKeys.push(col.name);
    }

    if (primaryKeys.length > 0) {
      lines.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    const tableEdges = edges.filter((e) => e.source === node.id);
    for (const edge of tableEdges) {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (targetNode && edge.data) {
        const edgeData = edge.data as any;
        if (edgeData.sourceColumn && edgeData.targetColumn) {
          lines.push(
            `  FOREIGN KEY (${edgeData.sourceColumn}) REFERENCES ${targetNode.data.label}(${edgeData.targetColumn})`
          );
        }
      }
    }

    statements.push(`CREATE TABLE ${table.label} (\n${lines.join(',\n')}\n);`);
  }

  return statements.join('\n\n');
}
