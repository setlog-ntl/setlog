'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Loader2,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Code,
  Eye,
  Rocket,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/i18n';
import {
  useDeployFiles,
  useFileContent,
  useUpdateFile,
  useMyDeployments,
} from '@/lib/queries/oneclick';
import { toast } from 'sonner';
import Link from 'next/link';

interface SiteEditorClientProps {
  deployId: string;
}

function isHtmlFile(path: string | null): boolean {
  if (!path) return false;
  return path.toLowerCase().endsWith('.html') || path.toLowerCase().endsWith('.htm');
}

function isCssFile(path: string | null): boolean {
  if (!path) return false;
  return path.toLowerCase().endsWith('.css');
}

type DeployState = 'idle' | 'saving' | 'deploying' | 'deployed';

export function SiteEditorClient({ deployId }: SiteEditorClientProps) {
  const { locale } = useLocaleStore();
  const { data: files, isLoading: filesLoading } = useDeployFiles(deployId);
  const { data: deployments } = useMyDeployments();
  const updateFile = useUpdateFile();

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [deployState, setDeployState] = useState<DeployState>('idle');
  const [livePreviewKey, setLivePreviewKey] = useState(0);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const liveIframeRef = useRef<HTMLIFrameElement>(null);

  const [fileCache, setFileCache] = useState<Record<string, string>>({});

  const { data: fileDetail, isLoading: contentLoading } = useFileContent(
    deployId,
    selectedPath
  );

  const deploy = deployments?.find((d) => d.id === deployId);
  const liveUrl = deploy?.pages_url || deploy?.deployment_url;

  // index.html 자동 선택
  useEffect(() => {
    if (files && files.length > 0 && !selectedPath) {
      const indexFile = files.find((f) => f.name.toLowerCase() === 'index.html');
      setSelectedPath(indexFile ? indexFile.path : files[0].path);
    }
  }, [files, selectedPath]);

  // 파일 내용 동기화
  useEffect(() => {
    if (fileDetail) {
      setEditorContent(fileDetail.content);
      setHasUnsavedChanges(false);
      setFileCache((prev) => ({ ...prev, [fileDetail.path]: fileDetail.content }));
    }
  }, [fileDetail]);

  useEffect(() => {
    if (selectedPath) {
      setFileCache((prev) => ({ ...prev, [selectedPath]: editorContent }));
    }
  }, [editorContent, selectedPath]);

  // 미리보기 HTML 조합
  const previewHtml = useMemo(() => {
    const htmlPath = isHtmlFile(selectedPath)
      ? selectedPath
      : files?.find((f) => isHtmlFile(f.path))?.path || null;

    const htmlContent = htmlPath
      ? (htmlPath === selectedPath ? editorContent : (fileCache[htmlPath] || ''))
      : '';

    if (!htmlContent) return '';

    const baseTag = liveUrl ? `<base href="${liveUrl}/" target="_blank">` : '';

    const cssFiles = files?.filter((f) => isCssFile(f.path)) || [];
    const cssContents = cssFiles
      .map((f) => f.path === selectedPath ? editorContent : (fileCache[f.path] || ''))
      .filter(Boolean);

    const inlineStyle = cssContents.length > 0
      ? `<style data-linkmap-preview>\n${cssContents.join('\n')}\n</style>`
      : '';

    const injected = [baseTag, inlineStyle].filter(Boolean).join('\n');

    if (htmlContent.includes('<head>')) {
      return htmlContent.replace('<head>', `<head>\n${injected}`);
    }
    if (htmlContent.includes('</head>')) {
      return htmlContent.replace('</head>', `${injected}\n</head>`);
    }
    return injected + '\n' + htmlContent;
  }, [editorContent, selectedPath, files, fileCache, liveUrl]);

  // iframe 미리보기 반영
  useEffect(() => {
    if (!showPreview || !previewRef.current) return;
    const isEditingHtmlOrCss = isHtmlFile(selectedPath) || isCssFile(selectedPath);
    if (isEditingHtmlOrCss && previewHtml) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml, showPreview, selectedPath]);

  const handleContentChange = useCallback((value: string) => {
    setEditorContent(value);
    setHasUnsavedChanges(true);
  }, []);

  const handleTabSwitch = useCallback(
    (path: string) => {
      if (hasUnsavedChanges) {
        const msg = t(locale, 'editor.unsavedChanges');
        if (!window.confirm(msg)) return;
      }
      setSelectedPath(path);
      setHasUnsavedChanges(false);
    },
    [hasUnsavedChanges, locale]
  );

  // 저장 (GitHub 커밋만)
  const handleSave = useCallback(async () => {
    if (!selectedPath || !fileDetail) return;
    try {
      const result = await updateFile.mutateAsync({
        deployId,
        path: selectedPath,
        content: editorContent,
        sha: fileDetail.sha,
      });
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      fileDetail.sha = result.sha;
      toast.success(t(locale, 'editor.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장 실패');
    }
  }, [selectedPath, fileDetail, editorContent, deployId, updateFile, locale]);

  // 배포 (저장 → GitHub Pages 빌드 대기 → 라이브 미리보기 새로고침)
  const handleDeploy = useCallback(async () => {
    if (!selectedPath || !fileDetail) return;

    try {
      // 1단계: 미저장 변경이 있으면 먼저 저장
      setDeployState('saving');
      if (hasUnsavedChanges) {
        const result = await updateFile.mutateAsync({
          deployId,
          path: selectedPath,
          content: editorContent,
          sha: fileDetail.sha,
        });
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date());
        fileDetail.sha = result.sha;
      }

      // 2단계: GitHub Pages 빌드 대기 (커밋 후 자동 빌드 트리거됨)
      setDeployState('deploying');
      toast.info(
        locale === 'ko'
          ? 'GitHub Pages 배포 중... 약 30초 소요됩니다.'
          : 'Deploying to GitHub Pages... ~30 seconds.'
      );

      // GitHub Pages 빌드 완료 대기 (폴링)
      if (liveUrl) {
        let attempts = 0;
        const maxAttempts = 12; // 최대 60초
        const checkInterval = 5000; // 5초마다

        await new Promise<void>((resolve) => {
          const poll = setInterval(async () => {
            attempts++;
            try {
              // cache-bust로 새 버전 확인
              const res = await fetch(`${liveUrl}?_t=${Date.now()}`, {
                method: 'HEAD',
                mode: 'no-cors',
              });
              // 응답이 오면 빌드 완료로 간주 (no-cors라 status 확인 불가하지만 네트워크 성공)
              if (attempts >= 6) {
                // 최소 30초 대기 후 성공 처리
                clearInterval(poll);
                resolve();
              }
            } catch {
              // 네트워크 오류는 무시
            }
            if (attempts >= maxAttempts) {
              clearInterval(poll);
              resolve();
            }
          }, checkInterval);
        });
      } else {
        // liveUrl 없으면 30초 대기
        await new Promise((r) => setTimeout(r, 30000));
      }

      // 3단계: 배포 완료 → 라이브 미리보기 새로고침
      setDeployState('deployed');
      setLivePreviewKey((k) => k + 1);

      toast.success(
        locale === 'ko'
          ? '배포 완료! 사이트에 변경사항이 반영되었습니다.'
          : 'Deployed! Changes are now live.'
      );

      // 3초 후 상태 초기화
      setTimeout(() => setDeployState('idle'), 3000);
    } catch (err) {
      setDeployState('idle');
      toast.error(err instanceof Error ? err.message : '배포 실패');
    }
  }, [selectedPath, fileDetail, hasUnsavedChanges, editorContent, deployId, updateFile, locale, liveUrl]);

  // Ctrl+S 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasUnsavedChanges, handleSave]);

  // 페이지 이탈 경고
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const isLivePreviewable = isHtmlFile(selectedPath) || isCssFile(selectedPath);
  const isDeploying = deployState === 'saving' || deployState === 'deploying';

  // 배포 버튼 라벨
  const deployButtonContent = (() => {
    switch (deployState) {
      case 'saving':
        return (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {locale === 'ko' ? '저장 중...' : 'Saving...'}
          </>
        );
      case 'deploying':
        return (
          <>
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            {locale === 'ko' ? '배포 중...' : 'Deploying...'}
          </>
        );
      case 'deployed':
        return (
          <>
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {locale === 'ko' ? '배포 완료!' : 'Deployed!'}
          </>
        );
      default:
        return (
          <>
            <Rocket className="mr-1 h-3 w-3" />
            {locale === 'ko' ? '배포' : 'Deploy'}
          </>
        );
    }
  })();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* 툴바 */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-sites">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t(locale, 'editor.backToSites')}
            </Link>
          </Button>
          {deploy && (
            <span className="text-sm font-medium">{deploy.site_name}</span>
          )}
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              {locale === 'ko' ? '미저장' : 'Unsaved'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 미리보기 토글 */}
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <><PanelRightClose className="mr-1 h-3 w-3" />{locale === 'ko' ? '미리보기' : 'Preview'}</>
            ) : (
              <><PanelRightOpen className="mr-1 h-3 w-3" />{locale === 'ko' ? '미리보기' : 'Preview'}</>
            )}
          </Button>
          {liveUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                {locale === 'ko' ? '사이트 열기' : 'Open Site'}
              </a>
            </Button>
          )}
          {/* 저장 버튼 */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || updateFile.isPending || isDeploying}
          >
            {updateFile.isPending ? (
              <><Loader2 className="mr-1 h-3 w-3 animate-spin" />{t(locale, 'editor.saving')}</>
            ) : (
              <><Save className="mr-1 h-3 w-3" />{t(locale, 'editor.save')}</>
            )}
          </Button>
          {/* 배포 버튼 */}
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={isDeploying || (!hasUnsavedChanges && deployState === 'idle' && !lastSavedAt)}
            className={deployState === 'deployed' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {deployButtonContent}
          </Button>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 파일 사이드바 */}
        <div className="w-48 border-r bg-muted/30 overflow-y-auto flex-shrink-0">
          {filesLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : files && files.length > 0 ? (
            <div className="py-1">
              {files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => handleTabSwitch(file.path)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
                    selectedPath === file.path
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground">
              {t(locale, 'editor.noFiles')}
            </div>
          )}
        </div>

        {/* 코드 에디터 + 미리보기 분할 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 코드 에디터 */}
          <div className={`flex flex-col overflow-hidden ${showPreview ? 'w-1/2 border-r' : 'w-full'}`}>
            <div className="border-b px-3 py-1.5 flex items-center gap-2 bg-muted/20 text-xs text-muted-foreground flex-shrink-0">
              <Code className="h-3 w-3" />
              <span>{selectedPath || ''}</span>
            </div>

            {contentLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedPath ? (
              <textarea
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm bg-background resize-none focus:outline-none border-0"
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                {t(locale, 'editor.loadingFiles')}
              </div>
            )}
          </div>

          {/* 실시간 미리보기 */}
          {showPreview && (
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="border-b px-3 py-1.5 flex items-center gap-2 bg-muted/20 text-xs text-muted-foreground flex-shrink-0">
                <Eye className="h-3 w-3" />
                <span>{locale === 'ko' ? '실시간 미리보기' : 'Live Preview'}</span>
                {isLivePreviewable && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-auto">
                    LIVE
                  </Badge>
                )}
                {deployState === 'deployed' && (
                  <Badge variant="default" className="text-[10px] px-1 py-0 ml-auto bg-green-600">
                    {locale === 'ko' ? '배포됨' : 'DEPLOYED'}
                  </Badge>
                )}
              </div>

              {isLivePreviewable && deployState !== 'deployed' ? (
                <iframe
                  ref={previewRef}
                  title="미리보기"
                  className="flex-1 w-full bg-white border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : liveUrl ? (
                <iframe
                  ref={liveIframeRef}
                  key={livePreviewKey}
                  src={`${liveUrl}?_t=${livePreviewKey}`}
                  title="사이트 미리보기"
                  className="flex-1 w-full bg-white border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  {locale === 'ko' ? '미리보기할 수 없는 파일입니다' : 'Cannot preview this file'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 상태 바 */}
      <div className="border-t px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-3">
          <span>{selectedPath || ''}</span>
          <span className="text-muted-foreground/60">
            {locale === 'ko' ? 'Ctrl+S 저장 · 배포 버튼으로 사이트 반영' : 'Ctrl+S save · Deploy to publish'}
          </span>
        </div>
        {lastSavedAt && (
          <span>
            {t(locale, 'editor.lastSaved')}:{' '}
            {lastSavedAt.toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US')}
          </span>
        )}
      </div>
    </div>
  );
}
