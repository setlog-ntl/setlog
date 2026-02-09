'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import HeroAppNode from './hero-app-node';
import HeroServiceNode from './hero-service-node';
import type { ServiceCategory } from '@/types';

interface HeroService {
  name: string;
  category: ServiceCategory;
}

const HERO_SERVICES: HeroService[] = [
  { name: 'Supabase', category: 'database' },
  { name: 'Vercel', category: 'deploy' },
  { name: 'Stripe', category: 'payment' },
  { name: 'Clerk', category: 'auth' },
  { name: 'Resend', category: 'email' },
  { name: 'OpenAI', category: 'ai' },
  { name: 'Sentry', category: 'monitoring' },
  { name: 'Cloudinary', category: 'storage' },
];

function buildCircularLayout(count: number, cx: number, cy: number, rx: number, ry: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });
}

const nodeTypes = {
  heroApp: HeroAppNode,
  heroService: HeroServiceNode,
};

export function HeroDiagram() {
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);

  const cx = 200;
  const cy = 180;
  const positions = useMemo(() => buildCircularLayout(HERO_SERVICES.length, cx, cy, 160, 140), []);

  const initialNodes: Node[] = useMemo(() => {
    const appNode: Node = {
      id: 'app',
      type: 'heroApp',
      position: { x: cx - 60, y: cy - 30 },
      data: { label: '내 앱' },
      draggable: false,
      selectable: false,
    };

    const serviceNodes: Node[] = HERO_SERVICES.map((svc, i) => ({
      id: `svc-${i}`,
      type: 'heroService',
      position: { x: positions[i].x - 50, y: positions[i].y - 18 },
      data: {
        label: svc.name,
        category: svc.category,
        highlighted: highlightedIdx === i,
      },
      draggable: false,
      selectable: false,
    }));

    return [appNode, ...serviceNodes];
  }, [positions, highlightedIdx]);

  const initialEdges: Edge[] = useMemo(() =>
    HERO_SERVICES.map((_, i) => ({
      id: `e-app-svc-${i}`,
      source: 'app',
      target: `svc-${i}`,
      type: 'default',
      animated: highlightedIdx === i,
      style: {
        stroke: highlightedIdx === i ? 'var(--primary)' : 'var(--border)',
        strokeWidth: highlightedIdx === i ? 2.5 : 1.5,
        opacity: highlightedIdx !== null && highlightedIdx !== i ? 0.3 : 1,
      },
    })), [highlightedIdx]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Auto-highlight cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedIdx((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % HERO_SERVICES.length;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    const idx = parseInt(node.id.replace('svc-', ''), 10);
    if (!isNaN(idx)) setHighlightedIdx(idx);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHighlightedIdx(null);
  }, []);

  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3 }}
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
