'use client';

import { useState } from 'react';
import { usePackages } from '@/lib/queries/packages';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Download, Package as PackageIcon, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export function PackageBrowserClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'newest'>('popular');
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePackages({
    q: searchQuery || undefined,
    tag: selectedTag || undefined,
    sort,
    page,
    limit: 12,
  });

  const popularTags = ['saas', 'nextjs', 'fullstack', 'ai', 'ecommerce', 'blog', 'auth', 'mobile'];

  return (
    <div className="space-y-6">
      {/* 검색 & 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="패키지 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSort(sort === 'popular' ? 'newest' : 'popular')}
          className="shrink-0"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sort === 'popular' ? '인기순' : '최신순'}
        </Button>
      </div>

      {/* 태그 필터 */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedTag === '' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => { setSelectedTag(''); setPage(1); }}
        >
          전체
        </Badge>
        {popularTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => { setSelectedTag(selectedTag === tag ? '' : tag); setPage(1); }}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* 패키지 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.packages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <PackageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">패키지가 없습니다</p>
          <p className="text-sm mt-1">검색어를 변경하거나 새 패키지를 만들어보세요</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.packages.map((pkg) => (
              <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                        <Download className="h-3 w-3" />
                        {pkg.downloads_count}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pkg.description_ko || pkg.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {pkg.tags?.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          {data && data.total > data.limit && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                이전
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">
                {page} / {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / data.limit)}
                onClick={() => setPage(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
