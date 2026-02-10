'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryProcessDiagram } from './category-process-diagram';
import type { EasyCategory } from '@/types';
import {
  easyCategoryLabels,
  easyCategoryEmojis,
  easyCategoryDescriptions,
  easyCategoryProcessFlows,
} from '@/lib/constants/easy-categories';

interface EasyCategoryCardProps {
  category: EasyCategory;
  serviceCount: number;
  selected: boolean;
  onClick: () => void;
}

export function EasyCategoryCard({ category, serviceCount, selected, onClick }: EasyCategoryCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{easyCategoryEmojis[category]}</span>
            <div>
              <h3 className="font-semibold text-sm">{easyCategoryLabels[category]}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{easyCategoryDescriptions[category]}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {serviceCount}개
          </Badge>
        </div>
        <CategoryProcessDiagram steps={easyCategoryProcessFlows[category]} />
      </CardContent>
    </Card>
  );
}
