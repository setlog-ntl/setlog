'use client';

interface HealthSparklineProps {
  data: number[];
  height?: number;
  width?: number;
}

export function HealthSparkline({ data, height = 24, width = 80 }: HealthSparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const lastValue = data[data.length - 1];
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length;
  const color = lastValue > avgValue * 1.5 ? '#ef4444' : '#22c55e';

  return (
    <div className="inline-flex items-center gap-1.5">
      <svg width={width} height={height} className="shrink-0">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs text-muted-foreground">{lastValue}ms</span>
    </div>
  );
}
