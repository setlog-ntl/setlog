'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function AppNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 rounded-xl border-2 border-primary bg-primary/10 shadow-md min-w-[160px]">
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
      <Handle type="source" position={Position.Left} className="!bg-primary !w-3 !h-3" />
      <Handle type="source" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="text-center">
        <div className="text-lg font-bold">{data.label as string}</div>
        <div className="text-xs text-muted-foreground mt-0.5">내 앱</div>
      </div>
    </div>
  );
}

export default memo(AppNode);
