'use client';

import { LayoutDashboard, DollarSign, Activity, GitBranch, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServiceMapStore, type ViewMode } from '@/stores/service-map-store';

const viewModeOptions: { value: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
  { value: 'default', label: '기본', icon: LayoutDashboard },
  { value: 'cost', label: '비용', icon: DollarSign },
  { value: 'health', label: '상태', icon: Activity },
  { value: 'dependency', label: '의존성', icon: GitBranch },
  { value: 'bento', label: '카드', icon: LayoutGrid },
];

export function ViewModeSelector() {
  const { viewMode, setViewMode } = useServiceMapStore();
  const current = viewModeOptions.find((o) => o.value === viewMode) || viewModeOptions[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={viewMode === 'default' ? 'outline' : 'default'}
          size="sm"
          className="h-8"
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          {viewModeOptions.map(({ value, label, icon: ItemIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <ItemIcon className="mr-2 h-4 w-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
