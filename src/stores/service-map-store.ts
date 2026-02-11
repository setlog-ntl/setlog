import { create } from 'zustand';

export type ViewMode = 'default' | 'cost' | 'health' | 'dependency' | 'bento';

interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string | null; // null = pane context menu
}

interface ServiceMapState {
  sidebarOpen: boolean;
  viewMode: ViewMode;
  focusedNodeId: string | null;
  collapsedGroups: Set<string>;
  contextMenu: ContextMenuState | null;
  expandedNodeId: string | null;
  bottomPanelOpen: boolean;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  setFocusedNodeId: (id: string | null) => void;
  toggleGroupCollapsed: (groupKey: string) => void;
  setContextMenu: (menu: ContextMenuState | null) => void;
  setExpandedNodeId: (id: string | null) => void;
  setBottomPanelOpen: (open: boolean) => void;
  toggleBottomPanel: () => void;
}

export const useServiceMapStore = create<ServiceMapState>((set) => ({
  sidebarOpen: false,
  viewMode: 'default',
  focusedNodeId: null,
  collapsedGroups: new Set<string>(),
  contextMenu: null,
  expandedNodeId: null,
  bottomPanelOpen: true,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setFocusedNodeId: (id) => set((s) => ({ focusedNodeId: s.focusedNodeId === id ? null : id })),
  toggleGroupCollapsed: (groupKey) =>
    set((s) => {
      const next = new Set(s.collapsedGroups);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return { collapsedGroups: next };
    }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setExpandedNodeId: (id) => set((s) => ({ expandedNodeId: s.expandedNodeId === id ? null : id })),
  setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
}));
