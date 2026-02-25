'use client';

import { EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { RelationData } from '@/types/database';

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationData = data as unknown as RelationData;
  const relType = relationData?.relationType || 'one-to-many';
  const sourceCol = relationData?.sourceColumn || '?';
  const targetCol = relationData?.targetColumn || '?';

  let typeLabel = '1 : N';
  let sourceType = 'one';
  let targetType = 'many';

  if (relType === 'one-to-one') {
    typeLabel = '1 : 1';
    sourceType = 'one';
    targetType = 'one';
  } else if (relType === 'many-to-many') {
    typeLabel = 'N : M';
    sourceType = 'many';
    targetType = 'many';
  }

  const color = '#6366f1';
  const markerSize = 10;

  const sourceMarkers = [];
  const targetMarkers = [];

  if (sourceType === 'one') {
    sourceMarkers.push(
      <line key="s-one" x1={sourceX + 6} y1={sourceY - markerSize} x2={sourceX + 6} y2={sourceY + markerSize} stroke={color} strokeWidth={2} />
    );
  } else {
    sourceMarkers.push(
      <line key="s-m1" x1={sourceX} y1={sourceY} x2={sourceX + 14} y2={sourceY - markerSize} stroke={color} strokeWidth={2} />,
      <line key="s-m2" x1={sourceX} y1={sourceY} x2={sourceX + 14} y2={sourceY} stroke={color} strokeWidth={2} />,
      <line key="s-m3" x1={sourceX} y1={sourceY} x2={sourceX + 14} y2={sourceY + markerSize} stroke={color} strokeWidth={2} />,
    );
  }

  if (targetType === 'one') {
    targetMarkers.push(
      <line key="t-one" x1={targetX - 6} y1={targetY - markerSize} x2={targetX - 6} y2={targetY + markerSize} stroke={color} strokeWidth={2} />
    );
  } else {
    targetMarkers.push(
      <line key="t-m1" x1={targetX} y1={targetY} x2={targetX - 14} y2={targetY - markerSize} stroke={color} strokeWidth={2} />,
      <line key="t-m2" x1={targetX} y1={targetY} x2={targetX - 14} y2={targetY} stroke={color} strokeWidth={2} />,
      <line key="t-m3" x1={targetX} y1={targetY} x2={targetX - 14} y2={targetY + markerSize} stroke={color} strokeWidth={2} />,
    );
  }

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        className="react-flow__edge-path"
      />

      {sourceMarkers}
      {targetMarkers}

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#0a0a0a',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 600,
            color: '#a5b4fc',
            border: '1px solid #6366f1',
            pointerEvents: 'all',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '2px',
            lineHeight: 1.3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          className="nodrag nopan"
        >
          <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>{typeLabel}</span>
          <span style={{ color: '#7c83db', fontSize: '9px', fontWeight: 400 }}>
            {sourceCol} → {targetCol}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
