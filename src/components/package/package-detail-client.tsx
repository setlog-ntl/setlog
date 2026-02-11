'use client';

import { useState } from 'react';
import { usePackage } from '@/lib/queries/packages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Copy, Check, Terminal } from 'lucide-react';
import Link from 'next/link';
import { InstallPackageDialog } from './install-package-dialog';
import type { LinkmapConfig } from '@/types/package';

interface PackageDetailClientProps {
  slug: string;
  projectOptions: { id: string; name: string }[];
}

export function PackageDetailClient({ slug, projectOptions }: PackageDetailClientProps) {
  const { data: pkg, isLoading } = usePackage(slug);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">패키지를 찾을 수 없습니다</p>
        <Link href="/packages">
          <Button variant="link" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            패키지 목록으로
          </Button>
        </Link>
      </div>
    );
  }

  const latestVersion = pkg.versions?.[0];
  const config = latestVersion?.config as LinkmapConfig | undefined;
  const cliCommand = `linkmap install ${slug}`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link href="/packages" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        패키지 목록
      </Link>

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{pkg.name}</h1>
          <p className="text-muted-foreground mt-1">{pkg.description_ko || pkg.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {pkg.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {pkg.downloads_count} 다운로드
            </span>
            {latestVersion && (
              <span>v{latestVersion.version}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={() => setInstallOpen(true)}>
            프로젝트에 적용
          </Button>
        </div>
      </div>

      {/* CLI 명령어 */}
      <Card>
        <CardContent className="flex items-center gap-3 py-3">
          <Terminal className="h-4 w-4 text-muted-foreground shrink-0" />
          <code className="text-sm flex-1 font-mono">{cliCommand}</code>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyCmd}>
            {copiedCmd ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">포함 서비스</TabsTrigger>
          <TabsTrigger value="env">환경변수</TabsTrigger>
          {config?.code_snippets && config.code_snippets.length > 0 && (
            <TabsTrigger value="snippets">코드 스니펫</TabsTrigger>
          )}
          <TabsTrigger value="versions">버전 히스토리</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config?.services.map((svc) => (
              <Card key={svc.slug}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{svc.slug}</CardTitle>
                    <Badge variant={svc.required ? 'default' : 'outline'} className="text-xs">
                      {svc.required ? '필수' : '선택'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    환경변수 {svc.env_vars.length}개
                  </p>
                  {svc.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{svc.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="env" className="mt-4">
          <Card>
            <CardContent className="py-4">
              <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-x-auto">
                {config?.services.map((svc) => {
                  const lines = [`# --- ${svc.slug} ---`];
                  svc.env_vars.forEach((ev) => {
                    if (ev.description) lines.push(`# ${ev.description}`);
                    lines.push(`${ev.key}=${ev.default_value || ''}`);
                  });
                  lines.push('');
                  return lines.join('\n');
                }).join('\n')}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {config?.code_snippets && config.code_snippets.length > 0 && (
          <TabsContent value="snippets" className="mt-4 space-y-4">
            {config.code_snippets.map((snippet, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono">{snippet.path}</CardTitle>
                    <Badge variant="outline" className="text-xs">{snippet.strategy}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{snippet.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg overflow-x-auto max-h-48">
                    {snippet.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}

        <TabsContent value="versions" className="mt-4">
          <div className="space-y-3">
            {pkg.versions?.map((ver) => (
              <Card key={ver.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-mono text-sm font-medium">v{ver.version}</span>
                    {ver.changelog && (
                      <p className="text-xs text-muted-foreground mt-0.5">{ver.changelog}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ver.published_at).toLocaleDateString('ko-KR')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 설치 다이얼로그 */}
      <InstallPackageDialog
        open={installOpen}
        onOpenChange={setInstallOpen}
        packageSlug={slug}
        packageName={pkg.name}
        services={config?.services || []}
        projectOptions={projectOptions}
      />
    </div>
  );
}
