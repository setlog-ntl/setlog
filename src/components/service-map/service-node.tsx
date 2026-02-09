'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ServiceCategory, FreeTierQuality } from '@/types';

const categoryColors: Partial<Record<ServiceCategory, string>> = {
  auth: 'bg-purple-100 border-purple-300 text-purple-800',
  database: 'bg-blue-100 border-blue-300 text-blue-800',
  deploy: 'bg-green-100 border-green-300 text-green-800',
  email: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  payment: 'bg-orange-100 border-orange-300 text-orange-800',
  storage: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  monitoring: 'bg-pink-100 border-pink-300 text-pink-800',
  ai: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  other: 'bg-gray-100 border-gray-300 text-gray-800',
};

const categoryLabels: Partial<Record<ServiceCategory, string>> = {
  auth: '인증',
  database: 'DB',
  deploy: '배포',
  email: '이메일',
  payment: '결제',
  storage: '스토리지',
  monitoring: '모니터링',
  ai: 'AI',
  other: '기타',
};

const statusIcons: Record<string, string> = {
  not_started: '⚪',
  in_progress: '🟡',
  connected: '🟢',
  error: '🔴',
};

const freeTierLabels: Record<FreeTierQuality, string> = {
  excellent: '무료 우수',
  good: '무료 양호',
  limited: '무료 제한',
  none: '유료',
};

interface ServiceNodeData {
  label: string;
  category: ServiceCategory;
  status: string;
  costEstimate?: string;
  freeTierQuality?: FreeTierQuality;
  [key: string]: unknown;
}

function ServiceNode({ data }: NodeProps) {
  const nodeData = data as unknown as ServiceNodeData;
  const category = nodeData.category as ServiceCategory;
  const colorClass = categoryColors[category] || categoryColors.other;

  const tooltipContent = [
    nodeData.freeTierQuality && `무료 플랜: ${freeTierLabels[nodeData.freeTierQuality]}`,
    nodeData.costEstimate && `예상 비용: ${nodeData.costEstimate}`,
  ].filter(Boolean);

  const node = (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[140px] ${colorClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-3 !h-3" />

      <div className="flex items-center gap-2">
        <span className="text-lg">{statusIcons[nodeData.status] || '⚪'}</span>
        <div>
          <div className="font-medium text-sm">{nodeData.label}</div>
          <div className="text-xs opacity-70">
            {categoryLabels[category] || category}
          </div>
        </div>
      </div>

      {nodeData.costEstimate && (
        <div className="text-[10px] opacity-60 mt-1 text-right">
          {nodeData.costEstimate}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-3 !h-3" />
    </div>
  );

  if (tooltipContent.length === 0) return node;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltipContent.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default memo(ServiceNode);
