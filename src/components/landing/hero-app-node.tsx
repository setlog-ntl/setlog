'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function HeroAppNode({ data }: NodeProps) {
  return (
    <div className="relative">
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse-ring" />
      <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse-ring [animation-delay:1s]" />

      {/* Main node */}
      <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 border-2 border-primary/50 min-w-[120px]">
        <Handle type="source" position={Position.Top} className="!bg-primary-foreground !w-2 !h-2 !border-0" />
        <Handle type="source" position={Position.Right} className="!bg-primary-foreground !w-2 !h-2 !border-0" />
        <Handle type="source" position={Position.Bottom} className="!bg-primary-foreground !w-2 !h-2 !border-0" />
        <Handle type="source" position={Position.Left} className="!bg-primary-foreground !w-2 !h-2 !border-0" />

        <div className="text-center">
          <div className="text-2xl mb-1">🚀</div>
          <div className="font-bold text-sm">{(data as Record<string, unknown>).label as string}</div>
        </div>
      </div>
    </div>
  );
}

export default memo(HeroAppNode);
