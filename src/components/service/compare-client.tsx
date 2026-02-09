'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { allCategoryLabels, allCategoryEmojis } from '@/lib/constants/service-filters';
import type { ServiceComparison, Service, ServiceCategory } from '@/types';

interface CompareClientProps {
  comparisons: ServiceComparison[];
  services: Pick<Service, 'id' | 'name' | 'slug'>[];
}

export function CompareClient({ comparisons, services }: CompareClientProps) {
  // Get unique categories from comparisons
  const categories = useMemo(() => {
    const cats = [...new Set(comparisons.map((c) => c.category))];
    return cats as ServiceCategory[];
  }, [comparisons]);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return comparisons;
    return comparisons.filter((c) => c.category === selectedCategory);
  }, [comparisons, selectedCategory]);

  // Build a service id->name/slug map
  const serviceMap = useMemo(() => {
    const map = new Map<string, { name: string; slug: string }>();
    services.forEach((s) => map.set(s.id, { name: s.name, slug: s.slug }));
    return map;
  }, [services]);

  if (comparisons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">비교 데이터가 아직 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category filter */}
      <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ServiceCategory | 'all')}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="카테고리 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 카테고리</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {allCategoryEmojis[cat]} {allCategoryLabels[cat] || cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Comparison matrices */}
      {filtered.map((comparison) => {
        const serviceIds = comparison.services || [];
        const serviceNames = serviceIds.map((id) => serviceMap.get(id)?.name || id);
        const criteria = comparison.comparison_data?.criteria || [];

        return (
          <Card key={comparison.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {allCategoryEmojis[comparison.category as ServiceCategory]}{' '}
                  {allCategoryLabels[comparison.category as ServiceCategory] || comparison.category}
                </Badge>
                <CardTitle className="text-lg">
                  {comparison.title_ko || comparison.title || '서비스 비교'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comparison table */}
              {criteria.length > 0 && (
                <ScrollArea className="w-full">
                  <table className="w-full text-sm border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2 px-3 font-medium w-[160px]">기준</th>
                        {serviceNames.map((name, i) => (
                          <th key={i} className="text-left py-2 px-3 font-medium">
                            {serviceMap.get(serviceIds[i])?.slug ? (
                              <Link
                                href={`/services/${serviceMap.get(serviceIds[i])?.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {name}
                              </Link>
                            ) : (
                              name
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map((criterion, ci) => (
                        <tr key={ci} className="border-b">
                          <td className="py-2 px-3 font-medium text-muted-foreground">
                            {criterion.name_ko || criterion.name}
                          </td>
                          {serviceIds.map((id, si) => (
                            <td key={si} className="py-2 px-3">
                              {criterion.values[id] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}

              {/* Recommendations */}
              {comparison.recommendation && Object.keys(comparison.recommendation).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">이런 경우 이것을 선택하세요</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(comparison.recommendation).map(([key, rec]) => (
                      <Card key={key} className="border-dashed">
                        <CardContent className="p-4 space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">필요:</span>{' '}
                            <span className="font-medium">{rec.need}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">선택:</span>{' '}
                            <span className="font-medium text-primary">{rec.choose}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            이유: {rec.because}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
