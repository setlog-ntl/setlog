'use client';

import { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';
import type { UserConnectionType } from '@/types';

const connectionStyles: Record<UserConnectionType, { color: string; dash: string; label: string }> = {
  uses:          { color: '#3b82f6', dash: '0',   label: '사용' },
  integrates:    { color: '#22c55e', dash: '0',   label: '연동' },
  data_transfer: { color: '#f97316', dash: '6 3', label: '데이터 전달' },
};

interface UserConnectionEdgeData {
  connectionType: UserConnectionType;
  connectMode?: boolean;
  onDelete?: (edgeId: string) => void;
  [key: string]: unknown;
}

function UserConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const edgeData = data as unknown as UserConnectionEdgeData;
  const connType = edgeData?.connectionType || 'uses';
  const style = connectionStyles[connType] || connectionStyles.uses;
  const connectMode = edgeData?.connectMode ?? false;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      {/* Invisible wider path for hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="react-flow__edge-interaction"
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.color,
          strokeWidth: 2,
          strokeDasharray: style.dash !== '0' ? style.dash : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center gap-1">
            <span
              className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
              style={{
                backgroundColor: 'var(--background)',
                color: style.color,
                borderColor: style.color,
              }}
            >
              {style.label}
            </span>
            {hovered && connectMode && edgeData?.onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  edgeData.onDelete?.(id);
                }}
                className="rounded-full bg-destructive text-destructive-foreground p-0.5 shadow-sm hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(UserConnectionEdge);
