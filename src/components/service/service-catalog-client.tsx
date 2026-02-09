'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ExternalLink, ArrowRight } from 'lucide-react';
import { domainLabels, domainIcons, allCategoryLabels, allCategoryEmojis, domainCategoryMap } from '@/lib/constants/service-filters';
import { DifficultyBadge, DxScoreBadge, FreeTierBadge, CostEstimateBadge } from './service-badges';
import type { Service, ServiceCategory, ServiceDomain, ServiceDomainRecord, FreeTierQuality } from '@/types';

type SortOption = 'popularity' | 'name' | 'dx_score' | 'difficulty';

const sortLabels: Record<SortOption, string> = {
  popularity: '인기순',
  name: '이름순',
  dx_score: 'DX 점수순',
  difficulty: '난이도순',
};

const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };

interface ServiceCatalogClientProps {
  services: Service[];
  domains: ServiceDomainRecord[];
}

export function ServiceCatalogClient({ services, domains }: ServiceCatalogClientProps) {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<ServiceDomain | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [freeTierFilter, setFreeTierFilter] = useState<FreeTierQuality | 'all'>('all');

  // Available categories based on selected domain
  const availableCategories = useMemo(() => {
    if (selectedDomain === 'all') return Object.keys(allCategoryLabels) as ServiceCategory[];
    return domainCategoryMap[selectedDomain] || [];
  }, [selectedDomain]);

  // Reset category when domain changes
  const handleDomainChange = (domain: ServiceDomain | 'all') => {
    setSelectedDomain(domain);
    setSelectedCategory('all');
  };

  const filteredServices = useMemo(() => {
    let result = services.filter((s) => {
      // Domain filter
      if (selectedDomain !== 'all' && s.domain !== selectedDomain) return false;
      // Category filter
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      // Free tier filter
      if (freeTierFilter !== 'all' && s.free_tier_quality !== freeTierFilter) return false;
      // Search (includes tags)
      if (search) {
        const q = search.toLowerCase();
        const tagMatch = s.tags?.some((t) => t.toLowerCase().includes(q));
        return (
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.description_ko?.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          tagMatch
        );
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dx_score':
          return (b.dx_score || 0) - (a.dx_score || 0);
        case 'difficulty':
          return (difficultyOrder[a.difficulty_level || 'intermediate'] || 1) -
                 (difficultyOrder[b.difficulty_level || 'intermediate'] || 1);
        default:
          return 0;
      }
    });

    return result;
  }, [services, selectedDomain, selectedCategory, freeTierFilter, search, sortBy]);

  const domainKeys: ServiceDomain[] = domains.length > 0
    ? (domains.map((d) => d.id) as ServiceDomain[])
    : (Object.keys(domainLabels) as ServiceDomain[]);

  return (
    <div className="space-y-6">
      {/* Domain filter pills */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={selectedDomain === 'all' ? 'default' : 'outline'}
          className="cursor-pointer text-sm px-3 py-1"
          onClick={() => handleDomainChange('all')}
        >
          전체
        </Badge>
        {domainKeys.map((domain) => (
          <Badge
            key={domain}
            variant={selectedDomain === domain ? 'default' : 'outline'}
            className="cursor-pointer text-sm px-3 py-1"
            onClick={() => handleDomainChange(domain)}
          >
            {domainIcons[domain]} {domainLabels[domain]}
          </Badge>
        ))}
      </div>

      {/* Category filter pills (contextual) */}
      {selectedDomain !== 'all' && availableCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs px-2 py-0.5"
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </Badge>
          {availableCategories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer text-xs px-2 py-0.5"
              onClick={() => setSelectedCategory(cat)}
            >
              {allCategoryEmojis[cat]} {allCategoryLabels[cat]}
            </Badge>
          ))}
        </div>
      )}

      {/* Search + Sort + Free tier filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="서비스 검색 (이름, 설명, 태그)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={freeTierFilter} onValueChange={(v) => setFreeTierFilter(v as FreeTierQuality | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="무료 플랜" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">무료 플랜: 전체</SelectItem>
            <SelectItem value="excellent">우수</SelectItem>
            <SelectItem value="good">양호</SelectItem>
            <SelectItem value="limited">제한적</SelectItem>
            <SelectItem value="none">없음</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow group">
            <Link href={`/services/${service.slug}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                      {allCategoryEmojis[service.category as ServiceCategory] || '🔧'}
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {service.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {allCategoryLabels[service.category as ServiceCategory] || service.category}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {service.description_ko || service.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <DifficultyBadge level={service.difficulty_level} />
                  <FreeTierBadge quality={service.free_tier_quality} />
                  <CostEstimateBadge estimate={service.monthly_cost_estimate} />
                </div>
                <DxScoreBadge score={service.dx_score} />
              </CardContent>
            </Link>
            <div className="px-6 pb-4 flex gap-2">
              {service.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={service.website_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    웹사이트
                  </a>
                </Button>
              )}
              {service.docs_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={service.docs_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    문서
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? `"${search}"에 대한 검색 결과가 없습니다` : '서비스가 없습니다'}
          </p>
        </div>
      )}
    </div>
  );
}
