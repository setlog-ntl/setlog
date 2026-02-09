'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ServiceCategory } from '@/types';

const categoryColors: Record<string, string> = {
  auth: 'bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800',
  database: 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
  deploy: 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800',
  email: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800',
  payment: 'bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800',
  storage: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-800',
  monitoring: 'bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-800',
  ai: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800',
  other: 'bg-gray-50 border-gray-200 dark:bg-gray-950/50 dark:border-gray-800',
};

const categoryEmojis: Record<string, string> = {
  auth: '🔐',
  database: '🗄️',
  deploy: '🚀',
  email: '📧',
  payment: '💳',
  storage: '☁️',
  monitoring: '📊',
  ai: '🤖',
  other: '⚙️',
};

interface HeroServiceNodeData {
  label: string;
  category: ServiceCategory;
  highlighted?: boolean;
  [key: string]: unknown;
}

function HeroServiceNode({ data }: NodeProps) {
  const nodeData = data as unknown as HeroServiceNodeData;
  const colorClass = categoryColors[nodeData.category] || categoryColors.other;
  const emoji = categoryEmojis[nodeData.category] || '⚙️';

  return (
    <div
      className={`px-3 py-2 rounded-xl border-2 shadow-sm transition-all duration-300 ${colorClass} ${
        nodeData.highlighted
          ? 'scale-110 shadow-md ring-2 ring-primary/30'
          : 'hover:scale-105'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-2 !h-2 !border-0 dark:!bg-gray-600" />
      <Handle type="target" position={Position.Left} className="!bg-gray-300 !w-2 !h-2 !border-0 dark:!bg-gray-600" />
      <Handle type="target" position={Position.Bottom} className="!bg-gray-300 !w-2 !h-2 !border-0 dark:!bg-gray-600" />
      <Handle type="target" position={Position.Right} className="!bg-gray-300 !w-2 !h-2 !border-0 dark:!bg-gray-600" />

      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <span className="font-medium text-xs">{nodeData.label}</span>
      </div>
    </div>
  );
}

export default memo(HeroServiceNode);
