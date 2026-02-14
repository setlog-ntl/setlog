'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  BackgroundVariant,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import ServiceNode from '@/components/service-map/service-node';
import AppNode from '@/components/service-map/app-node';
import GroupNode from '@/components/service-map/group-node';
import DependencyEdge from '@/components/service-map/dependency-edge';
import UserConnectionEdge from '@/components/service-map/user-connection-edge';
import { MapToolbar, type GroupMode, type LayoutDirection, type StatusFilter } from '@/components/service-map/map-toolbar';
import { ServiceDetailSheet } from '@/components/service-map/service-detail-sheet';
import { CatalogSidebar } from '@/components/service-map/catalog-sidebar';
import { EmptyMapState } from '@/components/service-map/empty-map-state';
import { NodeContextMenu } from '@/components/service-map/node-context-menu';
import { StatusOverviewBar } from '@/components/service-map/status-overview-bar';
import { ServiceBentoGrid } from '@/components/service-map/service-bento-grid';
import { DependencyChainPanel } from '@/components/service-map/dependency-chain-panel';
import { HealthStatsPanel } from '@/components/service-map/health-stats-panel';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DollarSign, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon } from 'lucide-react';
import { allCategoryLabels, allCategoryEmojis, domainLabels, domainIcons } from '@/lib/constants/service-filters';
import { getCategoryStyle } from '@/lib/constants/category-styles';
import { easyCategoryLabels, easyCategoryEmojis, serviceCategoryToEasy } from '@/lib/constants/easy-categories';
import { getLayoutedElements } from '@/lib/layout/dagre-layout';
import { getNeighborhood, isNodeHighlighted, isEdgeHighlighted } from '@/lib/layout/graph-utils';
import { shouldShowEdgeInViewMode } from '@/lib/layout/view-mode-styles';
import { useProjectConnections, useCreateConnection, useDeleteConnection } from '@/lib/queries/connections';
import { useProjectServices, useCatalogServices, useRemoveProjectService } from '@/lib/queries/services';
import { useLatestHealthChecks, useRunHealthCheck } from '@/lib/queries/health-checks';
import { useServiceDependencies } from '@/lib/queries/dependencies';
import { useServiceAccounts } from '@/lib/queries/service-accounts';
import { useEnvVars } from '@/lib/queries/env-vars';
import { useServiceMapStore } from '@/stores/service-map-store';
import { createClient } from '@/lib/supabase/client';
import type { ProjectService, Service, ServiceCategory, ServiceDomain, ServiceDependency, DependencyType, UserConnectionType, UserConnection } from '@/types';

const nodeTypes = {
  service: ServiceNode,
  app: AppNode,
  group: GroupNode,
};

const edgeTypes = {
  dependency: DependencyEdge,
  userConnection: UserConnectionEdge,
};

// Stable empty array to prevent re-renders from default destructuring
const EMPTY_CONNECTIONS: UserConnection[] = [];


function ServiceMapInner() {
  const params = useParams();
  const projectId = params.id as string;
  const supabaseRef = useRef(createClient());

  // OAuth 성공 리다이렉트 처리 (useSearchParams 대신 window.location 사용 — Suspense 불필요)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    if (oauthSuccess) {
      toast.success(`${oauthSuccess} 계정이 연결되었습니다`);
      const url = new URL(window.location.href);
      url.searchParams.delete('oauth_success');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Zustand store
  const {
    viewMode,
    focusedNodeId,
    setFocusedNodeId,
    collapsedGroups,
    toggleGroupCollapsed,
    contextMenu,
    setContextMenu,
    expandedNodeId,
    setExpandedNodeId,
    setSidebarOpen,
    bottomPanelOpen,
    toggleBottomPanel,
  } = useServiceMapStore();

  const [projectName, setProjectName] = useState('내 앱');
  const [groupMode, setGroupMode] = useState<GroupMode>('category');
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('TB');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedService, setSelectedService] = useState<(ProjectService & { service: Service }) | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [connectMode, setConnectMode] = useState(false);
  const [connectionType, setConnectionType] = useState<UserConnectionType>('uses');

  // TanStack Query hooks
  const { data: services = [], isLoading: servicesLoading } = useProjectServices(projectId);
  const { data: catalogServices = [], isLoading: catalogLoading } = useCatalogServices();
  const { data: healthChecks = {} } = useLatestHealthChecks(projectId);
  const runHealthCheck = useRunHealthCheck();
  const removeService = useRemoveProjectService(projectId);

  // Dependencies via TanStack Query (이전: 수동 useEffect → 레이스 컨디션 원인)
  const { data: dependencies = [], isLoading: depsLoading } = useServiceDependencies();

  // Service accounts (계정 연결 상태)
  const { data: serviceAccounts = [] } = useServiceAccounts(projectId);

  // Environment variables
  const { data: envVars = [] } = useEnvVars(projectId);

  // Fetch user connections
  const { data: userConnections = EMPTY_CONNECTIONS, isLoading: connectionsLoading } = useProjectConnections(projectId);
  const createConnectionMutation = useCreateConnection(projectId);
  const deleteConnectionMutation = useDeleteConnection(projectId);

  // Stable refs for mutations
  const createConnectionRef = useRef(createConnectionMutation);
  createConnectionRef.current = createConnectionMutation;
  const deleteConnectionRef = useRef(deleteConnectionMutation);
  deleteConnectionRef.current = deleteConnectionMutation;

  // Stable ref for toggleGroupCollapsed to avoid infinite re-render loop
  const toggleGroupCollapsedRef = useRef(toggleGroupCollapsed);
  toggleGroupCollapsedRef.current = toggleGroupCollapsed;

  // Fetch project name
  useEffect(() => {
    const supabase = supabaseRef.current;
    const fetchProjectName = async () => {
      const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      if (project) setProjectName(project.name);
    };
    fetchProjectName();
  }, [projectId]);

  // Service name lookup
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

  // Current service IDs
  const currentServiceIds = useMemo(() => {
    return new Set(filteredServices.map((ps) => ps.service_id));
  }, [filteredServices]);

  // Relevant dependencies
  const relevantDependencies = useMemo(() => {
    return dependencies.filter(
      (dep) => currentServiceIds.has(dep.service_id) && currentServiceIds.has(dep.depends_on_service_id)
    );
  }, [dependencies, currentServiceIds]);

  // Selected service deps
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
    const connectionId = edgeId.replace('uc-', '');
    deleteConnectionRef.current.mutate(connectionId, {
      onSuccess: () => {
        toast.success('연결이 삭제되었습니다');
      },
      onError: (error) => {
        toast.error(error.message || '연결 삭제에 실패했습니다');
      },
    });
  }, []);

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

    const groups = new Map<string, { label: string; emoji: string; childCount: number }>();

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
            childCount: 0,
          });
        }
      } else if (groupMode === 'domain' && domain) {
        groupKey = domain;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, { label: domainLabels[domain], emoji: domainIcons[domain], childCount: 0 });
        }
      } else {
        groupKey = category;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            label: allCategoryLabels[category] || category,
            emoji: allCategoryEmojis[category] || '🔧',
            childCount: 0,
          });
        }
      }

      // Increment child count
      const g = groups.get(groupKey)!;
      g.childCount++;

      // Skip nodes in collapsed groups
      if (collapsedGroups.has(groupKey)) return;

      // Cost estimate
      const estimate = ps.service?.monthly_cost_estimate;
      let costEstimate: string | undefined;
      if (estimate && typeof estimate === 'object') {
        const vals = Object.values(estimate);
        if (vals.length > 0) costEstimate = vals[0] as string;
      }

      const iconSlug = ps.service?.slug;
      const hc = healthChecks[ps.id];
      const isExpanded = expandedNodeId === ps.id;

      // Connection count for this service
      const connectionCount = userConnections.filter(
        (c) => c.source_service_id === ps.service_id || c.target_service_id === ps.service_id
      ).length;

      // Service account status
      const serviceAccount = serviceAccounts.find((sa) => sa.service_id === ps.service_id);
      const accountStatus = serviceAccount?.status;

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
          // Phase 2A: health data
          healthStatus: hc?.status,
          healthCheck: hc,
          envVarCount: envVars.filter((ev) => ev.service_id === ps.service_id).length,
          requiredEnvVarCount: ps.service?.required_env_vars?.length || 0,
          // Phase 2A: expanded mode
          expanded: isExpanded,
          // Phase 2B: view mode
          viewMode,
          // Phase 3A: connection count
          connectionCount,
          // Service account status
          accountStatus,
        },
      });
    });

    // Add group background nodes
    groups.forEach((value, key) => {
      const isCollapsed = collapsedGroups.has(key);
      nodes.push({
        id: `group-${key}`,
        type: 'group',
        position: { x: 0, y: 0 },
        data: {
          label: value.label,
          emoji: value.emoji,
          collapsed: isCollapsed,
          childCount: value.childCount,
          groupKey: key,
          onToggleCollapse: () => toggleGroupCollapsedRef.current(key),
        },
        style: { zIndex: -1 },
      });
    });

    return nodes;
  }, [filteredServices, projectName, groupMode, searchQuery, healthChecks, expandedNodeId, viewMode, collapsedGroups, userConnections, serviceAccounts, envVars]);

  // Build edges
  const rawEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = [];

    // App → service edges
    filteredServices.forEach((ps) => {
      // Skip edges to nodes in collapsed groups
      const category = (ps.service?.category as ServiceCategory) || 'other';
      let groupKey: string;
      if (groupMode === 'easy') {
        groupKey = serviceCategoryToEasy[category] || 'analytics_other';
      } else if (groupMode === 'domain' && ps.service?.domain) {
        groupKey = ps.service.domain;
      } else {
        groupKey = category;
      }
      if (collapsedGroups.has(groupKey)) return;

      // Use gradient stroke for connected services with known category
      const gradientId = `url(#edge-gradient-${category})`;
      const hasGradient = ps.status === 'connected' && [
        'auth', 'database', 'deploy', 'payment', 'ai', 'monitoring', 'storage',
      ].includes(category);

      edges.push({
        id: `app-${ps.id}`,
        source: 'app',
        target: ps.id,
        type: 'smoothstep',
        animated: ps.status === 'connected',
        style: {
          stroke: hasGradient
            ? gradientId
            : ps.status === 'connected'
              ? 'var(--chart-2)'
              : ps.status === 'error'
                ? 'var(--destructive)'
                : 'var(--border)',
          strokeWidth: ps.status === 'connected' ? 2.5 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: ps.status === 'connected'
            ? (getCategoryStyle(category).hexColor || 'var(--chart-2)')
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

    // Dependency edges
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
  }, [filteredServices, relevantDependencies, userConnections, serviceIdToNodeId, connectMode, handleDeleteUserConnection, collapsedGroups, groupMode]);

  // Compute neighbor set for focus mode (Phase 3A)
  const neighborSet = useMemo(() => {
    if (!focusedNodeId) return null;
    return getNeighborhood(focusedNodeId, rawEdges);
  }, [focusedNodeId, rawEdges]);

  // Apply focus mode opacity to nodes
  const focusedNodes = useMemo<Node[]>(() => {
    if (!focusedNodeId) return rawNodes;
    return rawNodes.map((node) => {
      if (node.type === 'group' || node.type === 'app') return node;
      const highlighted = isNodeHighlighted(node.id, focusedNodeId, neighborSet);
      return {
        ...node,
        data: {
          ...node.data,
          focusOpacity: highlighted ? 1 : 0.2,
        },
      };
    });
  }, [rawNodes, focusedNodeId, neighborSet]);

  // Apply view mode edge filtering (Phase 2B)
  const viewFilteredEdges = useMemo<Edge[]>(() => {
    let edges = rawEdges.filter((e) => shouldShowEdgeInViewMode(viewMode, e.type));

    // Focus mode edge dimming
    if (focusedNodeId) {
      edges = edges.map((edge) => {
        const highlighted = isEdgeHighlighted(edge, focusedNodeId, neighborSet);
        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: highlighted ? 1 : 0.1,
          },
        };
      });
    }

    return edges;
  }, [rawEdges, viewMode, focusedNodeId, neighborSet]);

  // Compute node heights for expanded nodes
  const nodeHeights = useMemo<Record<string, number>>(() => {
    const heights: Record<string, number> = {};
    if (expandedNodeId) {
      heights[expandedNodeId] = 140; // expanded node is taller
    }
    return heights;
  }, [expandedNodeId]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nonGroupNodes = focusedNodes.filter((n) => n.type !== 'group');
    const layoutResult = getLayoutedElements(nonGroupNodes, viewFilteredEdges, {
      direction: layoutDirection,
      rankSep: 120,
      nodeSep: 50,
      nodeHeights,
    });

    return {
      nodes: [...layoutResult.nodes],
      edges: layoutResult.edges,
    };
  }, [focusedNodes, viewFilteredEdges, layoutDirection, nodeHeights]);

  // React state for nodes/edges
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connectMode) return;
      const sourcePS = filteredServices.find((s) => s.id === connection.source);
      const targetPS = filteredServices.find((s) => s.id === connection.target);

      if (sourcePS && targetPS && sourcePS.service_id !== targetPS.service_id) {
        createConnectionRef.current.mutate(
          {
            project_id: projectId,
            source_service_id: sourcePS.service_id,
            target_service_id: targetPS.service_id,
            connection_type: connectionType,
          },
          {
            onSuccess: () => {
              toast.success('연결이 생성되었습니다');
            },
            onError: (error) => {
              toast.error(error.message || '연결 생성에 실패했습니다');
            },
          },
        );
      }
    },
    [connectMode, connectionType, filteredServices, projectId]
  );

  // Node click — focus mode + detail sheet
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'group') return;
    if (node.id === 'app') return;

    // Toggle focus
    setFocusedNodeId(node.id);

    // Open detail sheet
    const svc = services.find((s) => s.id === node.id);
    if (svc) {
      setSelectedService(svc);
      setSheetOpen(true);
    }
  }, [services, setFocusedNodeId]);

  // Double-click — expand/collapse node
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'group' || node.id === 'app') return;
    setExpandedNodeId(node.id);
  }, [setExpandedNodeId]);

  // Pane click — clear focus
  const handlePaneClick = useCallback(() => {
    if (focusedNodeId) setFocusedNodeId(null);
  }, [focusedNodeId, setFocusedNodeId]);

  // Context menu handlers (Phase 1C)
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'group' || node.id === 'app') return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, [setContextMenu]);

  const handlePaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: null });
  }, [setContextMenu]);

  // Context menu action handlers
  const handleContextViewDetail = useCallback((nodeId: string) => {
    const svc = services.find((s) => s.id === nodeId);
    if (svc) {
      setSelectedService(svc);
      setSheetOpen(true);
    }
  }, [services]);

  const handleContextStartConnect = useCallback(() => {
    setConnectMode(true);
  }, []);

  const handleContextRunHealthCheck = useCallback((nodeId: string) => {
    runHealthCheck.mutate({ project_service_id: nodeId });
  }, [runHealthCheck]);

  const handleContextRemoveService = useCallback((nodeId: string) => {
    removeService.mutate(nodeId);
  }, [removeService]);

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
    return getCategoryStyle(cat).hexColor;
  }, []);

  // 모든 핵심 데이터 로드 완료 대기 (서비스 + 의존성 + 연결)
  const isDataLoading = servicesLoading || depsLoading || connectionsLoading;
  if (isDataLoading) {
    return <div className="h-[calc(100vh-16rem)] min-h-[500px] max-h-[900px] rounded-lg bg-muted animate-pulse" />;
  }

  // Empty state (Phase 1B)
  if (services.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold shrink-0">서비스 맵</h2>
        </div>
        <div className="h-[calc(100vh-16rem)] min-h-[500px] max-h-[900px]">
          <EmptyMapState projectId={projectId} />
        </div>
      </div>
    );
  }

  // SVG marker definitions for dependency arrows + gradient defs
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
        {/* Category gradient stroke definitions */}
        <linearGradient id="edge-gradient-auth" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="edge-gradient-database" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="edge-gradient-deploy" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="edge-gradient-payment" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="edge-gradient-ai" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="edge-gradient-monitoring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="edge-gradient-storage" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Determine if bottom panel should show
  const hasBottomPanel = viewMode === 'bento' || viewMode === 'dependency' || viewMode === 'health';
  const mapMaxHeight = hasBottomPanel && bottomPanelOpen ? 'max-h-[500px]' : 'max-h-[900px]';

  return (
    <TooltipProvider>
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

        {/* Status overview bar */}
        <StatusOverviewBar
          services={services}
          serviceAccounts={serviceAccounts}
          onServiceClick={(psId) => setFocusedNodeId(psId)}
        />

        <div className={`h-[calc(100vh-16rem)] min-h-[400px] ${mapMaxHeight} rounded-lg border bg-background relative flex overflow-hidden transition-all duration-300`}>
          {/* 카탈로그 사이드바 (Phase 1A) */}
          <CatalogSidebar
            projectId={projectId}
            catalogServices={catalogServices}
            projectServices={services}
            isLoading={catalogLoading}
          />

          {/* 맵 영역 */}
          <div className="flex-1 relative">
            {depMarkerDefs}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onPaneClick={handlePaneClick}
              onNodeContextMenu={handleNodeContextMenu}
              onPaneContextMenu={handlePaneContextMenu}
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
                  {viewMode !== 'default' && (
                    <div className="border-t pt-1.5 text-muted-foreground">
                      모드: {viewMode === 'cost' ? '비용' : viewMode === 'health' ? '상태' : viewMode === 'bento' ? '카드' : '의존성'}
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

          {/* Context menu (Phase 1C) */}
          <NodeContextMenu
            onViewDetail={handleContextViewDetail}
            onStartConnect={handleContextStartConnect}
            onRunHealthCheck={handleContextRunHealthCheck}
            onRemoveService={handleContextRemoveService}
          />
        </div>

        {/* Bottom panel toggle + panels */}
        {hasBottomPanel && (
          <div className="space-y-2">
            <button
              onClick={toggleBottomPanel}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {bottomPanelOpen ? (
                <><ChevronUpIcon className="h-3 w-3" /> 패널 접기</>
              ) : (
                <><ChevronDownIcon className="h-3 w-3" /> 패널 펼치기</>
              )}
            </button>

            {bottomPanelOpen && (
              <>
                {viewMode === 'bento' && (
                  <ServiceBentoGrid
                    services={services}
                    healthChecks={healthChecks}
                    dependencies={dependencies}
                    serviceNames={serviceNames}
                    userConnections={userConnections}
                  />
                )}

                {viewMode === 'dependency' && (
                  <DependencyChainPanel
                    services={services}
                    dependencies={dependencies}
                    serviceNames={serviceNames}
                  />
                )}

                {viewMode === 'health' && (
                  <HealthStatsPanel
                    services={services}
                    healthChecks={healthChecks}
                    userConnections={userConnections}
                  />
                )}
              </>
            )}
          </div>
        )}

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
          projectId={projectId}
          envVars={envVars}
        />
      </div>
    </TooltipProvider>
  );
}

export default function ServiceMapClient() {
  return (
    <ReactFlowProvider>
      <ServiceMapInner />
    </ReactFlowProvider>
  );
}
