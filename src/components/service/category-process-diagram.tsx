'use client';

import { ChevronRight } from 'lucide-react';
import type { ProcessStep } from '@/lib/constants/easy-categories';

interface CategoryProcessDiagramProps {
  steps: ProcessStep[];
}

export function CategoryProcessDiagram({ steps }: CategoryProcessDiagramProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 dark:bg-muted/30 px-2.5 py-1.5 text-sm">
            <span className="text-base">{step.emoji}</span>
            <span className="text-muted-foreground font-medium whitespace-nowrap">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
