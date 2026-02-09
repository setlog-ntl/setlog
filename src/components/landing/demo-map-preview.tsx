'use client';

import {
  ReactFlow,
  type Node,
  type Edge,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import HeroAppNode from './hero-app-node';
import HeroServiceNode from './hero-service-node';

const miniNodes: Node[] = [
  {
    id: 'mini-app',
    type: 'heroApp',
    position: { x: 120, y: 90 },
    data: { label: 'SaaS 앱' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'mini-svc-0',
    type: 'heroService',
    position: { x: 10, y: 10 },
    data: { label: 'Supabase', category: 'database' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'mini-svc-1',
    type: 'heroService',
    position: { x: 230, y: 10 },
    data: { label: 'Clerk', category: 'auth' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'mini-svc-2',
    type: 'heroService',
    position: { x: 10, y: 190 },
    data: { label: 'Stripe', category: 'payment' },
    draggable: false,
    selectable: false,
  },
  {
    id: 'mini-svc-3',
    type: 'heroService',
    position: { x: 230, y: 190 },
    data: { label: 'Vercel', category: 'deploy' },
    draggable: false,
    selectable: false,
  },
];

const miniEdges: Edge[] = [
  { id: 'me-0', source: 'mini-app', target: 'mini-svc-0', animated: true, style: { stroke: 'var(--border)', strokeWidth: 1.5 } },
  { id: 'me-1', source: 'mini-app', target: 'mini-svc-1', animated: true, style: { stroke: 'var(--border)', strokeWidth: 1.5 } },
  { id: 'me-2', source: 'mini-app', target: 'mini-svc-2', animated: true, style: { stroke: 'var(--border)', strokeWidth: 1.5 } },
  { id: 'me-3', source: 'mini-app', target: 'mini-svc-3', animated: true, style: { stroke: 'var(--border)', strokeWidth: 1.5 } },
];

const nodeTypes = {
  heroApp: HeroAppNode,
  heroService: HeroServiceNode,
};

export function DemoMapPreview() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden h-full relative">
      {/* Live indicator */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 border">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-medium">Live Preview</span>
      </div>

      <ReactFlow
        nodes={miniNodes}
        edges={miniEdges}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
