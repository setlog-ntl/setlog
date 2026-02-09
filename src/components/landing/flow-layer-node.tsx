'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const layerColors: Record<string, { bg: string; border: string; text: string }> = {
  source: {
    bg: 'bg-slate-50 dark:bg-slate-900/80',
    border: 'border-slate-300 dark:border-slate-600',
    text: 'text-slate-700 dark:text-slate-300',
  },
  frontend: {
    bg: 'bg-green-50 dark:bg-green-950/60',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-800 dark:text-green-300',
  },
  backend: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-800 dark:text-blue-300',
  },
  database: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-800 dark:text-purple-300',
  },
};

interface FlowLayerNodeData {
  label: string;
  emoji: string;
  layer: string;
  connectedCount?: number;
  totalCount?: number;
  checklistDone?: number;
  checklistTotal?: number;
  highlighted?: boolean;
  [key: string]: unknown;
}

function FlowLayerNode({ data }: NodeProps) {
  const d = data as unknown as FlowLayerNodeData;
  const colors = layerColors[d.layer] || layerColors.source;

  return (
    <div
      className={`px-5 py-3.5 rounded-2xl border-2 shadow-md transition-all duration-300 min-w-[140px]
        ${colors.bg} ${colors.border}
        ${d.highlighted ? 'scale-105 shadow-lg ring-2 ring-primary/30' : 'hover:scale-[1.02]'}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2 !border-0 dark:!bg-gray-500" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2 !border-0 dark:!bg-gray-500" />

      <div className="text-center">
        <div className="text-xl mb-1">{d.emoji}</div>
        <div className={`font-bold text-sm ${colors.text}`}>{d.label}</div>
        {d.totalCount != null && d.totalCount > 0 && (
          <div className="mt-1.5 space-y-0.5">
            <div className="text-[10px] text-muted-foreground">
              {d.connectedCount}/{d.totalCount} 연결됨
            </div>
            {d.checklistTotal != null && d.checklistTotal > 0 && (
              <div className="text-[10px] text-muted-foreground">
                {d.checklistDone}/{d.checklistTotal} 완료
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FlowLayerNode);
