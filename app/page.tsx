'use client';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStore } from '@/store/useStore';
import { TableNode } from '@/components/nodes/TableNode';
import CodeEditor from '@/components/CodeEditor';
import InspectorPanel from '@/components/InspectorPanel';
import Toolbar from '@/components/Toolbar';
import { RelationEdge } from '@/components/edges/RelationEdge';

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relation: RelationEdge };

export default function Home() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();

  return (
    <div className="app-layout">
      <CodeEditor />
      <main className="canvas-container">
        <Toolbar />
        <div className="canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode="Delete"
            className="react-flow-dark"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => (n.data as any)?.color || '#6366f1'}
              maskColor="rgba(0,0,0,0.7)"
            />
          </ReactFlow>
        </div>
      </main>
      <InspectorPanel />
    </div>
  );
}
