export interface Column {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string;
}

export interface TableData extends Record<string, unknown> {
  label: string;
  columns: Column[];
  color: string;
}

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-many';

export interface RelationData {
  relationType: RelationType;
  sourceColumn: string;
  targetColumn: string;
}

export interface DiagramExport {
  version: string;
  nodes: any[];
  edges: any[];
  viewport: { x: number; y: number; zoom: number };
}

export const DATA_TYPES = [
  'INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL(10,2)', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
  'VARCHAR(255)', 'VARCHAR(100)', 'TEXT', 'LONGTEXT', 'CHAR(1)', 'VARCHAR',
  'BOOLEAN',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR',
  'JSON', 'JSONB', 'UUID', 'BLOB', 'ENUM',
] as const;

export const TABLE_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
] as const;
