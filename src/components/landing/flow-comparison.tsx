'use client';

import { useMemo, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FlowServiceNode from './flow-service-node';
import { SIMPLE_FLOW, COMPLEX_FLOW, type FlowPreset } from '@/data/flow-presets';

const nodeTypes = { service: FlowServiceNode };

function PresetDiagram({ preset }: { preset: FlowPreset }) {
  const nodes: Node[] = useMemo(
    () =>
      preset.nodes.map((n) => ({
        id: n.id,
        type: 'service',
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          category: n.category,
          emoji: n.emoji,
          iconSlug: n.iconSlug,
          status: n.status,
          envConfigured: n.envVars.configured,
          envTotal: n.envVars.total,
        },
        draggable: false,
        selectable: false,
      })),
    [preset]
  );

  const edges: Edge[] = useMemo(
    () =>
      preset.edges.map((e, i) => ({
        id: `e-${preset.id}-${i}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: true,
        label: e.label,
        labelStyle: { fontSize: 10, fontWeight: 500, fill: 'var(--muted-foreground)' },
        labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        style: { stroke: 'var(--border)', strokeWidth: 1.5 },
      })),
    [preset]
  );

  return (
    <div className="h-[280px] md:h-[320px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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

export function FlowComparison() {
  const [tab, setTab] = useState('simple');
  const activePreset = tab === 'simple' ? SIMPLE_FLOW : COMPLEX_FLOW;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">간단한 흐름 (블로그)</TabsTrigger>
            <TabsTrigger value="complex">복잡한 흐름 (SaaS)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="simple" className="mt-0">
          <PresetDiagram preset={SIMPLE_FLOW} />
        </TabsContent>
        <TabsContent value="complex" className="mt-0">
          <PresetDiagram preset={COMPLEX_FLOW} />
        </TabsContent>
      </Tabs>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-6 px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground">
        <span>📊 {activePreset.stats.services}개 서비스</span>
        <span>📋 {activePreset.stats.envVars}개 환경변수</span>
        <span>⏱ {activePreset.stats.setupTime}</span>
      </div>
    </div>
  );
}
