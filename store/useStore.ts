import { create } from 'zustand';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { TableData, Column, RelationType, DiagramExport } from '@/types/database';

interface DiagramStore {
  nodes: Node<TableData>[];
  edges: Edge[];
  selectedNode: string | null;
  searchQuery: string;

  setSearchQuery: (query: string) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addTable: (label: string, color: string) => void;
  removeTable: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;

  addColumn: (nodeId: string, column: Column) => void;
  updateColumn: (nodeId: string, columnId: string, data: Partial<Column>) => void;
  removeColumn: (nodeId: string, columnId: string) => void;

  setRelationType: (edgeId: string, type: RelationType) => void;

  exportDiagram: () => DiagramExport;
  importDiagram: (data: DiagramExport) => void;
  loadFromParsedDBML: (tables: any[], relations: any[]) => void;
  clearDiagram: () => void;
}

export const useStore = create<DiagramStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  searchQuery: '',

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<TableData>[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const edge: Edge = {
      ...connection,
      id: `edge-${nanoid(8)}`,
      type: 'relation',
      data: {
        relationType: 'one-to-many' as RelationType,
        sourceColumn: connection.sourceHandle || '',
        targetColumn: connection.targetHandle || ''
      },
    };
    set({ edges: addEdge(edge, get().edges) });
  },

  addTable: (label, color) => {
    const newNode: Node<TableData> = {
      id: `table-${nanoid(8)}`,
      type: 'tableNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label,
        color,
        columns: [
          {
            id: nanoid(8),
            name: 'id',
            type: 'INT',
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false,
            isUnique: true,
            defaultValue: 'AUTO_INCREMENT',
          },
        ],
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  removeTable: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode === nodeId ? null : get().selectedNode,
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

  addColumn: (nodeId, column) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, columns: [...node.data.columns, column] } }
          : node
      ),
    });
  },

  updateColumn: (nodeId, columnId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            data: {
              ...node.data,
              columns: node.data.columns.map((col) =>
                col.id === columnId ? { ...col, ...data } : col
              ),
            },
          }
          : node
      ),
    });
  },

  removeColumn: (nodeId, columnId) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            data: { ...node.data, columns: node.data.columns.filter((c) => c.id !== columnId) },
          }
          : node
      ),
    });
  },

  setRelationType: (edgeId, type) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, relationType: type } } : edge
      ),
    });
  },

  exportDiagram: () => ({
    version: '1.0',
    nodes: get().nodes,
    edges: get().edges,
    viewport: { x: 0, y: 0, zoom: 1 },
  }),

  importDiagram: (data) => {
    set({ nodes: data.nodes, edges: data.edges });
  },

  loadFromParsedDBML: (tables, relations) => {
    const newNodes: Node<TableData>[] = tables.map(t => ({
      id: t.id,
      type: 'tableNode',
      position: t.position,
      data: t.data
    }));

    const newEdges: Edge[] = relations.map(r => ({
      id: r.id,
      source: r.source,
      target: r.target,
      sourceHandle: r.sourceHandle,
      targetHandle: r.targetHandle,
      type: 'relation',
      data: r.data
    }));

    set({ nodes: newNodes, edges: newEdges, selectedNode: null });
  },

  clearDiagram: () => set({ nodes: [], edges: [], selectedNode: null }),
}));
