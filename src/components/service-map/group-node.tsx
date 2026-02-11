'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface GroupNodeData {
  label: string;
  emoji: string;
  collapsed?: boolean;
  childCount?: number;
  groupKey?: string;
  onToggleCollapse?: () => void;
  [key: string]: unknown;
}

const groupGradients: Record<string, string> = {
  auth: 'from-purple-500/10 to-purple-500/5 border-purple-300/30 dark:border-purple-700/30',
  database: 'from-blue-500/10 to-blue-500/5 border-blue-300/30 dark:border-blue-700/30',
  deploy: 'from-green-500/10 to-green-500/5 border-green-300/30 dark:border-green-700/30',
  email: 'from-yellow-500/10 to-yellow-500/5 border-yellow-300/30 dark:border-yellow-700/30',
  payment: 'from-orange-500/10 to-orange-500/5 border-orange-300/30 dark:border-orange-700/30',
  storage: 'from-cyan-500/10 to-cyan-500/5 border-cyan-300/30 dark:border-cyan-700/30',
  monitoring: 'from-pink-500/10 to-pink-500/5 border-pink-300/30 dark:border-pink-700/30',
  ai: 'from-indigo-500/10 to-indigo-500/5 border-indigo-300/30 dark:border-indigo-700/30',
  search: 'from-sky-500/10 to-sky-500/5 border-sky-300/30 dark:border-sky-700/30',
  cdn: 'from-teal-500/10 to-teal-500/5 border-teal-300/30 dark:border-teal-700/30',
  cicd: 'from-slate-500/10 to-slate-500/5 border-slate-300/30 dark:border-slate-700/30',
  analytics: 'from-emerald-500/10 to-emerald-500/5 border-emerald-300/30 dark:border-emerald-700/30',
};

function GroupNode({ data }: NodeProps) {
  const d = data as unknown as GroupNodeData;
  const isCollapsed = d.collapsed === true;
  const childCount = d.childCount || 0;

  if (isCollapsed) {
    return (
      <div
        className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 dark:bg-muted/10 px-4 py-3 w-[200px] cursor-pointer hover:border-muted-foreground/50 transition-colors"
        onClick={d.onToggleCollapse}
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ChevronRight className="h-3 w-3" />
          <span>{d.emoji}</span>
          <span>{d.label}</span>
          <span className="ml-auto bg-muted rounded-full px-1.5 py-0.5 text-[10px]">
            {childCount}개
          </span>
        </div>
      </div>
    );
  }

  const gradientClass = d.groupKey ? groupGradients[d.groupKey] : undefined;

  return (
    <div
      className={`rounded-2xl border-2 border-dashed px-4 pt-2 pb-4 min-w-[200px] min-h-[120px] ${
        gradientClass
          ? `bg-gradient-to-b ${gradientClass}`
          : 'border-muted-foreground/20 bg-muted/10 dark:bg-muted/5'
      }`}
    >
      <div
        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 cursor-pointer hover:text-foreground transition-colors"
        onClick={d.onToggleCollapse}
      >
        <ChevronDown className="h-3 w-3" />
        <span>{d.emoji}</span>
        <span>{d.label}</span>
        {childCount > 0 && (
          <span className="ml-1 text-[10px] opacity-60 normal-case">({childCount})</span>
        )}
      </div>
    </div>
  );
}

export default memo(GroupNode);
