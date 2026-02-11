'use client';

import { useMyPackages, useDeletePackage } from '@/lib/queries/packages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Trash2, ExternalLink, Package as PackageIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function MyPackagesClient() {
  const { data, isLoading } = useMyPackages();
  const deleteMutation = useDeletePackage();

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`"${name}" 패키지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      await deleteMutation.mutateAsync(slug);
      toast.success('패키지가 삭제되었습니다');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.packages.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <PackageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">발행한 패키지가 없습니다</p>
        <p className="text-sm mt-1">프로젝트 설정에서 서비스 구성을 패키지로 내보내보세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.packages.map((pkg) => (
        <Card key={pkg.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{pkg.name}</CardTitle>
              <div className="flex items-center gap-1">
                <Badge variant={pkg.is_public ? 'default' : 'secondary'} className="text-xs">
                  {pkg.is_public ? '공개' : '비공개'}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pkg.description_ko || pkg.description}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {pkg.downloads_count}
                </span>
                <div className="flex gap-1">
                  {pkg.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <Link href={`/packages/${pkg.slug}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(pkg.slug, pkg.name)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
