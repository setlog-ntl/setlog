'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowLayerNode from './flow-layer-node';
import FlowServiceNode from './flow-service-node';
import { HERO_FLOW } from '@/data/flow-presets';

const nodeTypes = {
  layer: FlowLayerNode,
  service: FlowServiceNode,
};

// Nodes that act as "layer" hubs
const LAYER_IDS = new Set(['nextjs', 'backend']);

// Highlight paths: each path is a sequence of node IDs
const HIGHLIGHT_PATHS = [
  ['github', 'nextjs', 'backend', 'supabase'],
  ['github', 'nextjs', 'backend', 'clerk'],
  ['github', 'nextjs', 'backend', 'stripe'],
  ['github', 'nextjs', 'vercel'],
  ['github', 'nextjs', 'sentry'],
  ['github', 'nextjs', 'backend', 'openai'],
  ['github', 'nextjs', 'backend', 'resend'],
  ['github', 'nextjs', 'backend', 's3'],
  ['github', 'nextjs', 'posthog'],
];

function buildNodes(highlightedNodeIds: Set<string>): Node[] {
  return HERO_FLOW.nodes.map((n) => {
    const isLayer = LAYER_IDS.has(n.id);
    return {
      id: n.id,
      type: isLayer ? 'layer' : 'service',
      position: { x: n.x, y: n.y },
      data: isLayer
        ? {
            label: n.label,
            emoji: n.emoji,
            layer: n.id === 'nextjs' ? 'frontend' : n.id === 'backend' ? 'backend' : 'source',
            highlighted: highlightedNodeIds.has(n.id),
          }
        : {
            label: n.label,
            category: n.category,
            emoji: n.emoji,
            status: n.status,
            envConfigured: n.envVars.configured,
            envTotal: n.envVars.total,
            highlighted: highlightedNodeIds.has(n.id),
          },
      draggable: false,
      selectable: false,
    };
  });
}

function buildEdges(highlightedNodeIds: Set<string>): Edge[] {
  return HERO_FLOW.edges.map((e, i) => {
    const isHighlighted = highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target);
    return {
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: isHighlighted,
      label: e.label,
      labelStyle: {
        fontSize: 10,
        fontWeight: 500,
        fill: 'var(--muted-foreground)',
      },
      labelBgStyle: {
        fill: 'var(--background)',
        fillOpacity: 0.8,
      },
      labelBgPadding: [4, 2] as [number, number],
      style: {
        stroke: isHighlighted ? 'var(--primary)' : 'var(--border)',
        strokeWidth: isHighlighted ? 2.5 : 1.5,
        opacity: highlightedNodeIds.size > 0 && !isHighlighted ? 0.25 : 1,
      },
    };
  });
}

export function FlowArchitectureDiagram() {
  const [highlightedPath, setHighlightedPath] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const highlightedNodeIds = useMemo(() => {
    const path = HIGHLIGHT_PATHS[highlightedPath];
    return path ? new Set(path) : new Set<string>();
  }, [highlightedPath]);

  const currentNodes = useMemo(() => buildNodes(highlightedNodeIds), [highlightedNodeIds]);
  const currentEdges = useMemo(() => buildEdges(highlightedNodeIds), [highlightedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentEdges);

  useEffect(() => {
    setNodes(currentNodes);
    setEdges(currentEdges);
  }, [currentNodes, currentEdges, setNodes, setEdges]);

  // Auto-cycle highlight paths
  useEffect(() => {
    if (isHovering) return;
    intervalRef.current = setInterval(() => {
      setHighlightedPath((prev) => (prev + 1) % HIGHLIGHT_PATHS.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering]);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setIsHovering(true);
    // Find all paths that include this node
    const connectedNodes = new Set<string>();
    for (const path of HIGHLIGHT_PATHS) {
      if (path.includes(node.id)) {
        path.forEach((id) => connectedNodes.add(id));
      }
    }
    // If this node is in no highlight path, just highlight itself
    if (connectedNodes.size === 0) connectedNodes.add(node.id);
    // Find the first matching path index for consistency
    const pathIdx = HIGHLIGHT_PATHS.findIndex((p) => p.includes(node.id));
    if (pathIdx >= 0) setHighlightedPath(pathIdx);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <div className="w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden">
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
        fitViewOptions={{ padding: 0.2 }}
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
