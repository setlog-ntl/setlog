import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DifficultyLevel, FreeTierQuality, VendorLockInRisk } from '@/types';

// --- Difficulty Badge ---
const difficultyConfig: Record<DifficultyLevel, { label: string; className: string }> = {
  beginner: { label: '초급', className: 'bg-green-100 text-green-800 border-green-200' },
  intermediate: { label: '중급', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  advanced: { label: '고급', className: 'bg-red-100 text-red-800 border-red-200' },
};

export function DifficultyBadge({ level }: { level?: DifficultyLevel }) {
  if (!level) return null;
  const config = difficultyConfig[level];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// --- DX Score Badge ---
export function DxScoreBadge({ score }: { score?: number | null }) {
  if (score == null) return null;
  return (
    <div className="flex items-center gap-2">
      <Progress value={score * 10} className="h-2 w-16" />
      <span className="text-xs font-medium text-muted-foreground">{score}/10</span>
    </div>
  );
}

// --- Free Tier Badge ---
const freeTierConfig: Record<FreeTierQuality, { label: string; className: string }> = {
  excellent: { label: '무료 우수', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  good: { label: '무료 양호', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  limited: { label: '무료 제한', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  none: { label: '유료만', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function FreeTierBadge({ quality }: { quality?: FreeTierQuality }) {
  if (!quality) return null;
  const config = freeTierConfig[quality];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// --- Cost Estimate Badge ---
export function CostEstimateBadge({ estimate }: { estimate?: Record<string, string> }) {
  if (!estimate || Object.keys(estimate).length === 0) return null;
  const values = Object.values(estimate);
  const summary = values.length === 1 ? values[0] : `${values[0]}~${values[values.length - 1]}`;
  return (
    <span className="text-xs text-muted-foreground">
      월 {summary}
    </span>
  );
}

// --- Vendor Lock-In Badge ---
const lockInConfig: Record<VendorLockInRisk, { label: string; className: string }> = {
  low: { label: '종속성 낮음', className: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: '종속성 중간', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  high: { label: '종속성 높음', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function VendorLockInBadge({ risk }: { risk?: VendorLockInRisk }) {
  if (!risk) return null;
  const config = lockInConfig[risk];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
