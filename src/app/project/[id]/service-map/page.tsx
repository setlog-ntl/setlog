'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ServiceNode from '@/components/service-map/service-node';
import AppNode from '@/components/service-map/app-node';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, DollarSign } from 'lucide-react';
import { domainLabels, domainIcons } from '@/lib/constants/service-filters';
import type { ProjectService, Service, ServiceCategory, ServiceDomain } from '@/types';

const nodeTypes = {
  service: ServiceNode,
  app: AppNode,
};

const categoryPositions: Partial<Record<ServiceCategory, { x: number; y: number }>> = {
  auth: { x: -300, y: -150 },
  database: { x: -150, y: -250 },
  deploy: { x: 150, y: -250 },
  email: { x: 300, y: -150 },
  payment: { x: 300, y: 100 },
  storage: { x: 150, y: 200 },
  monitoring: { x: -150, y: 200 },
  ai: { x: -300, y: 100 },
  other: { x: 0, y: 250 },
};

const domainPositions: Record<ServiceDomain, { x: number; y: number }> = {
  infrastructure: { x: 0, y: -300 },
  backend: { x: -300, y: -150 },
  devtools: { x: 300, y: -150 },
  communication: { x: -300, y: 100 },
  business: { x: 300, y: 100 },
  ai_ml: { x: -150, y: 250 },
  observability: { x: 150, y: 250 },
  integration: { x: 0, y: 350 },
};

type GroupMode = 'category' | 'domain';

export default function ServiceMapPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();
  const [projectName, setProjectName] = useState('내 앱');
  const [services, setServices] = useState<(ProjectService & { service: Service })[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>('category');

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: project }, { data: svcData }] = await Promise.all([
        supabase.from('projects').select('name').eq('id', projectId).single(),
        supabase
          .from('project_services')
          .select('*, service:services(*)')
          .eq('project_id', projectId),
      ]);
      if (project) setProjectName(project.name);
      setServices((svcData as (ProjectService & { service: Service })[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [projectId, supabase]);

  // Compute total monthly cost estimate
  const totalCostSummary = useMemo(() => {
    const costs: string[] = [];
    services.forEach((ps) => {
      const estimate = ps.service?.monthly_cost_estimate;
      if (estimate && typeof estimate === 'object') {
        const vals = Object.values(estimate);
        if (vals.length > 0) costs.push(vals[0] as string);
      }
    });
    if (costs.length === 0) return null;
    return `${costs.length}개 서비스 비용 정보`;
  }, [services]);

  const initialNodes = useMemo<Node[]>(() => {
    const nodes: Node[] = [
      {
        id: 'app',
        type: 'app',
        position: { x: 0, y: 0 },
        data: { label: projectName },
      },
    ];

    const groupCounts: Record<string, number> = {};

    services.forEach((ps) => {
      const category = ps.service?.category as ServiceCategory || 'other';
      const domain = ps.service?.domain as ServiceDomain | undefined;

      let basePos: { x: number; y: number };
      let groupKey: string;

      if (groupMode === 'domain' && domain) {
        groupKey = domain;
        basePos = domainPositions[domain] || domainPositions.integration;
      } else {
        groupKey = category;
        basePos = categoryPositions[category] || categoryPositions.other || { x: 0, y: 250 };
      }

      const count = groupCounts[groupKey] || 0;
      groupCounts[groupKey] = count + 1;
      const offset = count * 30;

      // Cost estimate summary
      const estimate = ps.service?.monthly_cost_estimate;
      let costEstimate: string | undefined;
      if (estimate && typeof estimate === 'object') {
        const vals = Object.values(estimate);
        if (vals.length > 0) costEstimate = vals[0] as string;
      }

      nodes.push({
        id: ps.id,
        type: 'service',
        position: {
          x: basePos.x + offset,
          y: basePos.y + offset,
        },
        data: {
          label: ps.service?.name || 'Unknown',
          category,
          status: ps.status,
          costEstimate,
          freeTierQuality: ps.service?.free_tier_quality,
        },
      });
    });

    return nodes;
  }, [services, projectName, groupMode]);

  const initialEdges = useMemo<Edge[]>(() => {
    return services.map((ps) => ({
      id: `app-${ps.id}`,
      source: 'app',
      target: ps.id,
      animated: ps.status === 'connected',
      style: {
        stroke: ps.status === 'connected' ? '#22c55e' : ps.status === 'error' ? '#ef4444' : '#94a3b8',
        strokeWidth: 2,
      },
    }));
  }, [services]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  if (loading) {
    return <div className="h-[600px] rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">서비스 맵</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={groupMode === 'category' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupMode('category')}
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            카테고리별
          </Button>
          <Button
            variant={groupMode === 'domain' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupMode('domain')}
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            도메인별
          </Button>
        </div>
      </div>

      <div className="h-[600px] rounded-lg border bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
        >
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />

          {/* Legend panel */}
          <Panel position="top-right">
            <div className="flex gap-2 text-xs bg-background/80 backdrop-blur rounded-lg p-2 border">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 연결됨</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> 진행 중</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> 시작 전</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 오류</span>
            </div>
          </Panel>

          {/* Monthly cost summary panel */}
          <Panel position="bottom-left">
            <Card className="w-[220px]">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  월간 비용 요약
                </div>
                <div className="space-y-1">
                  {services.filter((ps) => ps.service?.monthly_cost_estimate && Object.keys(ps.service.monthly_cost_estimate).length > 0).length > 0 ? (
                    services
                      .filter((ps) => ps.service?.monthly_cost_estimate && Object.keys(ps.service.monthly_cost_estimate).length > 0)
                      .map((ps) => {
                        const estimate = ps.service?.monthly_cost_estimate;
                        const firstVal = estimate ? Object.values(estimate)[0] : null;
                        return (
                          <div key={ps.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate mr-2">{ps.service?.name}</span>
                            <span className="font-medium shrink-0">{firstVal as string}</span>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-xs text-muted-foreground">비용 정보 없음</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
