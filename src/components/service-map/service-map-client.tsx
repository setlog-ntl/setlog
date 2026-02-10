'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ServiceNode from '@/components/service-map/service-node';
import AppNode from '@/components/service-map/app-node';
import GroupNode from '@/components/service-map/group-node';
import DependencyEdge from '@/components/service-map/dependency-edge';
import UserConnectionEdge from '@/components/service-map/user-connection-edge';
import { MapToolbar, type GroupMode, type LayoutDirection, type StatusFilter } from '@/components/service-map/map-toolbar';
import { ServiceDetailSheet } from '@/components/service-map/service-detail-sheet';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { allCategoryLabels, allCategoryEmojis, domainLabels, domainIcons } from '@/lib/constants/service-filters';
import { easyCategoryLabels, easyCategoryEmojis, serviceCategoryToEasy } from '@/lib/constants/easy-categories';
import { getLayoutedElements } from '@/lib/layout/dagre-layout';
import { useProjectConnections, useCreateConnection, useDeleteConnection } from '@/lib/queries/connections';
import type { ProjectService, Service, ServiceCategory, ServiceDomain, ServiceDependency, DependencyType, UserConnectionType } from '@/types';

const nodeTypes = {
  service: ServiceNode,
  app: AppNode,
  group: GroupNode,
};

const edgeTypes = {
  dependency: DependencyEdge,
  userConnection: UserConnectionEdge,
};

// MiniMap color mapping
const categoryMiniMapColors: Record<string, string> = {
  auth: '#a855f7',
  database: '#3b82f6',
  deploy: '#22c55e',
  email: '#eab308',
  payment: '#f97316',
  storage: '#06b6d4',
  monitoring: '#ec4899',
  ai: '#6366f1',
  cdn: '#14b8a6',
  cicd: '#64748b',
  testing: '#84cc16',
  sms: '#f59e0b',
  push: '#f43f5e',
  chat: '#8b5cf6',
  search: '#0ea5e9',
  cms: '#d946ef',
  analytics: '#10b981',
  media: '#ef4444',
  queue: '#f97316',
  cache: '#eab308',
  logging: '#78716c',
  feature_flags: '#71717a',
  scheduling: '#6366f1',
  ecommerce: '#10b981',
  serverless: '#0ea5e9',
  code_quality: '#22c55e',
  automation: '#8b5cf6',
  other: '#9ca3af',
};

function ServiceMapInner() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [projectName, setProjectName] = useState('내 앱');
  const [services, setServices] = useState<(ProjectService & { service: Service })[]>([]);
  const [dependencies, setDependencies] = useState<ServiceDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>('category');
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('TB');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedService, setSelectedService] = useState<(ProjectService & { service: Service }) | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [connectMode, setConnectMode] = useState(false);
  const [connectionType, setConnectionType] = useState<UserConnectionType>('uses');

  // Fetch user connections
  const { data: userConnections = [] } = useProjectConnections(projectId);
  const createConnection = useCreateConnection(projectId);
  const deleteConnection = useDeleteConnection(projectId);

  // Fetch data
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

      // service_dependencies는 카탈로그 테이블 - 존재하지 않을 수 있음
      const { data: depData } = await supabase
        .from('service_dependencies')
        .select('*');
      setDependencies((depData as ServiceDependency[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [projectId, supabase]);

  // Service name lookup for sheet
  const serviceNames = useMemo(() => {
    const map: Record<string, string> = {};
    services.forEach((ps) => {
      if (ps.service) map[ps.service.id] = ps.service.name;
    });
    return map;
  }, [services]);

  // Filter services by status
  const filteredServices = useMemo(() => {
    if (statusFilter === 'all') return services;
    return services.filter((ps) => ps.status === statusFilter);
  }, [services, statusFilter]);

  // Current service IDs for dependency filtering
  const currentServiceIds = useMemo(() => {
    return new Set(filteredServices.map((ps) => ps.service_id));
  }, [filteredServices]);

  // Filter dependencies to only include ones between current project services
  const relevantDependencies = useMemo(() => {
    return dependencies.filter(
      (dep) => currentServiceIds.has(dep.service_id) && currentServiceIds.has(dep.depends_on_service_id)
    );
  }, [dependencies, currentServiceIds]);

  // Dependencies for selected service
  const selectedServiceDeps = useMemo(() => {
    if (!selectedService?.service) return [];
    return dependencies.filter((dep) => dep.service_id === selectedService.service_id);
  }, [selectedService, dependencies]);

  // Map service_id to project_service node id
  const serviceIdToNodeId = useMemo(() => {
    const map = new Map<string, string>();
    filteredServices.forEach((ps) => {
      map.set(ps.service_id, ps.id);
    });
    return map;
  }, [filteredServices]);

  // Handle delete user connection
  const handleDeleteUserConnection = useCallback((edgeId: string) => {
    // edgeId format: "uc-{connection.id}"
    const connectionId = edgeId.replace('uc-', '');
    deleteConnection.mutate(connectionId);
  }, [deleteConnection]);

  // Build nodes
  const rawNodes = useMemo<Node[]>(() => {
    const nodes: Node[] = [
      {
        id: 'app',
        type: 'app',
        position: { x: 0, y: 0 },
        data: { label: projectName },
      },
    ];

    // Group nodes
    const groups = new Map<string, { label: string; emoji: string }>();

    filteredServices.forEach((ps) => {
      const category = (ps.service?.category as ServiceCategory) || 'other';
      const domain = ps.service?.domain as ServiceDomain | undefined;
      const isMatch = searchQuery === '' || ps.service?.name.toLowerCase().includes(searchQuery.toLowerCase());

      let groupKey: string;
      if (groupMode === 'easy') {
        const easyKey = serviceCategoryToEasy[category] || 'analytics_other';
        groupKey = easyKey;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            label: easyCategoryLabels[easyKey],
            emoji: easyCategoryEmojis[easyKey],
          });
        }
      } else if (groupMode === 'domain' && domain) {
        groupKey = domain;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, { label: domainLabels[domain], emoji: domainIcons[domain] });
        }
      } else {
        groupKey = category;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            label: allCategoryLabels[category] || category,
            emoji: allCategoryEmojis[category] || '🔧',
          });
        }
      }

      // Cost estimate
      const estimate = ps.service?.monthly_cost_estimate;
      let costEstimate: string | undefined;
      if (estimate && typeof estimate === 'object') {
        const vals = Object.values(estimate);
        if (vals.length > 0) costEstimate = vals[0] as string;
      }

      // Map service slug to icon slug
      const iconSlug = ps.service?.slug;

      nodes.push({
        id: ps.id,
        type: 'service',
        position: { x: 0, y: 0 },
        data: {
          label: ps.service?.name || 'Unknown',
          category,
          status: ps.status,
          costEstimate,
          freeTierQuality: ps.service?.free_tier_quality,
          iconSlug,
          highlighted: isMatch,
          selected: selectedService?.id === ps.id,
        },
      });
    });

    // Add group background nodes
    groups.forEach((value, key) => {
      nodes.push({
        id: `group-${key}`,
        type: 'group',
        position: { x: 0, y: 0 },
        data: { label: value.label, emoji: value.emoji },
        style: { zIndex: -1 },
      });
    });

    return nodes;
  }, [filteredServices, projectName, groupMode, searchQuery, selectedService]);

  // Build edges
  const rawEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = [];

    // App → service edges
    filteredServices.forEach((ps) => {
      edges.push({
        id: `app-${ps.id}`,
        source: 'app',
        target: ps.id,
        type: 'smoothstep',
        animated: ps.status === 'connected',
        style: {
          stroke: ps.status === 'connected'
            ? 'var(--chart-2)'
            : ps.status === 'error'
              ? 'var(--destructive)'
              : 'var(--border)',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: ps.status === 'connected'
            ? 'var(--chart-2)'
            : ps.status === 'error'
              ? 'var(--destructive)'
              : 'var(--border)',
        },
        label: ps.status === 'connected' ? '연결됨' : ps.status === 'error' ? '오류' : undefined,
        labelStyle: { fontSize: 10, fill: 'var(--muted-foreground)' },
        labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      });
    });

    // Dependency edges (service → service)
    relevantDependencies.forEach((dep) => {
      const sourceNodeId = serviceIdToNodeId.get(dep.service_id);
      const targetNodeId = serviceIdToNodeId.get(dep.depends_on_service_id);
      if (sourceNodeId && targetNodeId) {
        edges.push({
          id: `dep-${dep.id}`,
          source: sourceNodeId,
          target: targetNodeId,
          type: 'dependency',
          data: { dependencyType: dep.dependency_type as DependencyType },
        });
      }
    });

    // User connection edges
    userConnections.forEach((conn) => {
      const sourceNodeId = serviceIdToNodeId.get(conn.source_service_id);
      const targetNodeId = serviceIdToNodeId.get(conn.target_service_id);
      if (sourceNodeId && targetNodeId) {
        edges.push({
          id: `uc-${conn.id}`,
          source: sourceNodeId,
          target: targetNodeId,
          type: 'userConnection',
          data: {
            connectionType: conn.connection_type,
            connectMode,
            onDelete: handleDeleteUserConnection,
          },
        });
      }
    });

    return edges;
  }, [filteredServices, relevantDependencies, userConnections, serviceIdToNodeId, connectMode, handleDeleteUserConnection]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // Filter out group nodes for layout
    const nonGroupNodes = rawNodes.filter((n) => n.type !== 'group');
    const layoutResult = getLayoutedElements(nonGroupNodes, rawEdges, {
      direction: layoutDirection,
      rankSep: 120,
      nodeSep: 50,
    });

    return {
      nodes: [...layoutResult.nodes],
      edges: layoutResult.edges,
    };
  }, [rawNodes, rawEdges, layoutDirection]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutedNodes, layoutedEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connectMode) return;

      // Find the service IDs from the node IDs
      const sourcePS = filteredServices.find((s) => s.id === connection.source);
      const targetPS = filteredServices.find((s) => s.id === connection.target);

      if (sourcePS && targetPS && sourcePS.service_id !== targetPS.service_id) {
        createConnection.mutate({
          project_id: projectId,
          source_service_id: sourcePS.service_id,
          target_service_id: targetPS.service_id,
          connection_type: connectionType,
        });
      }
    },
    [connectMode, connectionType, filteredServices, projectId, createConnection]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id === 'app' || node.type === 'group') return;
    const svc = services.find((s) => s.id === node.id);
    if (svc) {
      setSelectedService(svc);
      setSheetOpen(true);
    }
  }, [services]);

  const handleExportPng = useCallback(() => {
    const svgEl = document.querySelector('.react-flow__viewport');
    if (!svgEl) return;
    const canvas = document.createElement('canvas');
    const rect = svgEl.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `${projectName}-service-map.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  }, [projectName]);

  // MiniMap node color
  const getNodeColor = useCallback((node: Node) => {
    if (node.type === 'app') return 'var(--primary)';
    const d = node.data as Record<string, unknown>;
    const cat = d.category as string;
    return categoryMiniMapColors[cat] || '#9ca3af';
  }, []);

  if (loading) {
    return <div className="h-[calc(100vh-16rem)] min-h-[500px] max-h-[900px] rounded-lg bg-muted animate-pulse" />;
  }

  // SVG marker definitions for dependency arrows
  const depMarkerDefs = (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <marker id="dep-arrow-required" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--destructive)" />
        </marker>
        <marker id="dep-arrow-recommended" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
        </marker>
        <marker id="dep-arrow-optional" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
        </marker>
        <marker id="dep-arrow-alternative" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--chart-4)" />
        </marker>
      </defs>
    </svg>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold shrink-0">서비스 맵</h2>
        <MapToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          groupMode={groupMode}
          onGroupModeChange={setGroupMode}
          layoutDirection={layoutDirection}
          onLayoutDirectionChange={setLayoutDirection}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExportPng={handleExportPng}
          connectMode={connectMode}
          onConnectModeChange={setConnectMode}
          connectionType={connectionType}
          onConnectionTypeChange={setConnectionType}
        />
      </div>

      <div className="h-[calc(100vh-16rem)] min-h-[500px] max-h-[900px] rounded-lg border bg-background relative">
        {depMarkerDefs}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          connectionLineStyle={connectMode ? { stroke: '#3b82f6', strokeWidth: 2 } : undefined}
        >
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={getNodeColor}
            zoomable
            pannable
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />

          {/* Legend */}
          <Panel position="top-right">
            <div className="flex flex-col gap-2 text-xs bg-background/80 backdrop-blur rounded-lg p-2 border">
              <div className="flex gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 연결됨</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> 진행 중</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> 시작 전</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 오류</span>
              </div>
              {userConnections.length > 0 && (
                <div className="flex gap-2 border-t pt-1.5">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> 사용</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" /> 연동</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block border-dashed" style={{ borderTop: '2px dashed #f97316', height: 0 }} /> 데이터</span>
                </div>
              )}
            </div>
          </Panel>

          {/* Cost summary */}
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

      {/* Service detail sidebar */}
      <ServiceDetailSheet
        service={selectedService}
        dependencies={selectedServiceDeps}
        serviceNames={serviceNames}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelectedService(null);
        }}
      />
    </div>
  );
}

export default function ServiceMapClient() {
  return (
    <ReactFlowProvider>
      <ServiceMapInner />
    </ReactFlowProvider>
  );
}
