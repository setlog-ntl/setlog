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
  Code,
  Eye,
  Rocket,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  X,
} from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/i18n';
import {
  useDeployFiles,
  useFileContent,
  useUpdateFile,
  useBatchApplyFiles,
  useMyDeployments,
} from '@/lib/queries/oneclick';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChatTerminal, type CodeBlock } from './chat-terminal';

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
type MobileTab = 'code' | 'preview';

export function SiteEditorClient({ deployId }: SiteEditorClientProps) {
  const { locale } = useLocaleStore();
  const { data: files, isLoading: filesLoading } = useDeployFiles(deployId);
  const { data: deployments } = useMyDeployments();
  const updateFile = useUpdateFile();
  const batchApply = useBatchApplyFiles();

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [deployState, setDeployState] = useState<DeployState>('idle');
  const [livePreviewKey, setLivePreviewKey] = useState(0);
  const [showLiveAfterDeploy, setShowLiveAfterDeploy] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('code');
  const [showMobileFiles, setShowMobileFiles] = useState(false);
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
    if (!previewRef.current) return;
    const isEditingHtmlOrCss = isHtmlFile(selectedPath) || isCssFile(selectedPath);
    if (isEditingHtmlOrCss && previewHtml) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml, selectedPath, showPreview, mobileTab]);

  const handleContentChange = useCallback((value: string) => {
    setEditorContent(value);
    setHasUnsavedChanges(true);
    if (showLiveAfterDeploy) setShowLiveAfterDeploy(false);
  }, [showLiveAfterDeploy]);

  const handleTabSwitch = useCallback(
    (path: string) => {
      if (hasUnsavedChanges) {
        const msg = t(locale, 'editor.unsavedChanges');
        if (!window.confirm(msg)) return;
      }
      setSelectedPath(path);
      setHasUnsavedChanges(false);
      setShowMobileFiles(false);
    },
    [hasUnsavedChanges, locale]
  );

  // 저장
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

  // 배포
  const handleDeploy = useCallback(async () => {
    if (!selectedPath || !fileDetail) return;

    try {
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

      setDeployState('deploying');
      toast.info(
        locale === 'ko'
          ? 'GitHub Pages 배포 중... 약 30초 소요됩니다.'
          : 'Deploying to GitHub Pages... ~30 seconds.'
      );

      if (liveUrl) {
        let attempts = 0;
        const maxAttempts = 12;
        const checkInterval = 5000;

        await new Promise<void>((resolve) => {
          const poll = setInterval(async () => {
            attempts++;
            try {
              await fetch(`${liveUrl}?_t=${Date.now()}`, {
                method: 'HEAD',
                mode: 'no-cors',
              });
              if (attempts >= 6) {
                clearInterval(poll);
                resolve();
              }
            } catch {
              // ignore
            }
            if (attempts >= maxAttempts) {
              clearInterval(poll);
              resolve();
            }
          }, checkInterval);
        });
      } else {
        await new Promise((r) => setTimeout(r, 30000));
      }

      setDeployState('deployed');
      setLivePreviewKey((k) => k + 1);
      setShowLiveAfterDeploy(true);

      toast.success(
        locale === 'ko'
          ? '배포 완료! 사이트에 변경사항이 반영되었습니다.'
          : 'Deployed! Changes are now live.'
      );

      setTimeout(() => setDeployState('idle'), 3000);
    } catch (err) {
      setDeployState('idle');
      toast.error(err instanceof Error ? err.message : '배포 실패');
    }
  }, [selectedPath, fileDetail, hasUnsavedChanges, editorContent, deployId, updateFile, locale, liveUrl]);

  // 파일 경로 목록 + SHA 맵 (ChatTerminal에 전달)
  const allFilePaths = useMemo(() => {
    return files?.map((f) => f.path) || [];
  }, [files]);

  const filesShaMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (files) {
      for (const f of files) {
        map[f.path] = f.sha;
      }
    }
    return map;
  }, [files]);

  // AI 코드 적용 + 자동 배포
  const handleApplyFiles = useCallback(async (blocks: CodeBlock[]) => {
    try {
      setDeployState('saving');

      // 1. 각 파일 저장 (배치)
      const filesToSave = blocks.map((block) => ({
        path: block.filePath,
        content: block.code,
        sha: block.isNew ? undefined : filesShaMap[block.filePath],
      }));

      const { results } = await batchApply.mutateAsync({
        deployId,
        files: filesToSave,
      });

      // 현재 편집 중인 파일이 포함되어 있으면 에디터 갱신
      for (const block of blocks) {
        if (block.filePath === selectedPath) {
          setEditorContent(block.code);
          setHasUnsavedChanges(false);
        }
      }

      // SHA 맵 업데이트 (fileDetail이 있을 때)
      if (fileDetail) {
        const match = results.find((r) => r.path === fileDetail.path);
        if (match) {
          fileDetail.sha = match.sha;
        }
      }

      toast.success(
        locale === 'ko'
          ? `${results.length}개 파일 저장 완료`
          : `${results.length} file(s) saved`
      );

      // 2. 자동 배포 트리거
      setDeployState('deploying');
      toast.info(
        locale === 'ko'
          ? 'GitHub Pages 배포 중... 약 30초 소요됩니다.'
          : 'Deploying to GitHub Pages... ~30 seconds.'
      );

      if (liveUrl) {
        let attempts = 0;
        const maxAttempts = 12;
        const checkInterval = 5000;

        await new Promise<void>((resolve) => {
          const poll = setInterval(async () => {
            attempts++;
            try {
              await fetch(`${liveUrl}?_t=${Date.now()}`, {
                method: 'HEAD',
                mode: 'no-cors',
              });
              if (attempts >= 6) {
                clearInterval(poll);
                resolve();
              }
            } catch {
              // ignore
            }
            if (attempts >= maxAttempts) {
              clearInterval(poll);
              resolve();
            }
          }, checkInterval);
        });
      } else {
        await new Promise((r) => setTimeout(r, 30000));
      }

      setDeployState('deployed');
      setLivePreviewKey((k) => k + 1);
      setShowLiveAfterDeploy(true);

      toast.success(
        locale === 'ko'
          ? '배포 완료! 사이트에 변경사항이 반영되었습니다.'
          : 'Deployed! Changes are now live.'
      );

      setTimeout(() => setDeployState('idle'), 3000);
    } catch (err) {
      setDeployState('idle');
      toast.error(err instanceof Error ? err.message : '적용 실패');
    }
  }, [batchApply, deployId, selectedPath, fileDetail, filesShaMap, liveUrl, locale]);

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
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline ml-1">{locale === 'ko' ? '저장 중...' : 'Saving...'}</span>
          </>
        );
      case 'deploying':
        return (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline ml-1">{locale === 'ko' ? '배포 중...' : 'Deploying...'}</span>
          </>
        );
      case 'deployed':
        return (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">{locale === 'ko' ? '완료!' : 'Done!'}</span>
          </>
        );
      default:
        return (
          <>
            <Rocket className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">{locale === 'ko' ? '배포' : 'Deploy'}</span>
          </>
        );
    }
  })();

  // 미리보기 렌더링 (데스크탑/모바일 공용)
  const renderPreview = () => {
    if (showLiveAfterDeploy && liveUrl) {
      return (
        <iframe
          ref={liveIframeRef}
          key={`live-${livePreviewKey}`}
          src={`${liveUrl}?_t=${livePreviewKey}`}
          title="사이트 미리보기"
          className="flex-1 w-full bg-white border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }
    if (isLivePreviewable) {
      return (
        <iframe
          ref={previewRef}
          title="미리보기"
          className="flex-1 w-full bg-white border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }
    if (liveUrl) {
      return (
        <iframe
          ref={liveIframeRef}
          key={`fallback-${livePreviewKey}`}
          src={`${liveUrl}?_t=${livePreviewKey}`}
          title="사이트 미리보기"
          className="flex-1 w-full bg-white border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        {locale === 'ko' ? '미리보기할 수 없는 파일입니다' : 'Cannot preview this file'}
      </div>
    );
  };

  // 에디터 렌더링 (데스크탑/모바일 공용)
  const renderEditor = () => {
    if (contentLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (selectedPath) {
      return (
        <textarea
          value={editorContent}
          onChange={(e) => handleContentChange(e.target.value)}
          className="flex-1 w-full p-3 sm:p-4 font-mono text-xs sm:text-sm bg-background resize-none focus:outline-none border-0"
          spellCheck={false}
        />
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        {t(locale, 'editor.loadingFiles')}
      </div>
    );
  };

  // 파일 리스트 렌더링 (사이드바/오버레이 공용)
  const renderFileList = () => {
    if (filesLoading) {
      return (
        <div className="p-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      );
    }
    if (files && files.length > 0) {
      return (
        <div className="py-1">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => handleTabSwitch(file.path)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
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
      );
    }
    return (
      <div className="p-3 text-sm text-muted-foreground">
        {t(locale, 'editor.noFiles')}
      </div>
    );
  };

  const selectedFileName = selectedPath?.split('/').pop() || '';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* ===== 툴바 ===== */}
      <div className="border-b px-2 sm:px-4 py-2 flex items-center justify-between bg-background gap-2">
        {/* 좌측: 뒤로가기 + 사이트명 */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
            <Link href="/my-sites">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          {deploy && (
            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
              {deploy.site_name}
            </span>
          )}
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {locale === 'ko' ? '미저장' : 'Unsaved'}
            </Badge>
          )}
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 모바일: 파일 목록 토글 */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setShowMobileFiles(!showMobileFiles)}
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>

          {/* 데스크탑: 미리보기 토글 */}
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-1 h-3 w-3" />
            {locale === 'ko' ? '미리보기' : 'Preview'}
          </Button>

          {/* 사이트 열기 */}
          {liveUrl && (
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" title={locale === 'ko' ? '사이트 열기' : 'Open Site'}>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}

          {/* 저장 */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || updateFile.isPending || isDeploying}
            title={t(locale, 'editor.save')}
          >
            {updateFile.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* 배포 */}
          <Button
            size="sm"
            className={`h-8 px-2 sm:px-3 ${deployState === 'deployed' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={handleDeploy}
            disabled={isDeploying || (!hasUnsavedChanges && deployState === 'idle' && !lastSavedAt)}
          >
            {deployButtonContent}
          </Button>
        </div>
      </div>

      {/* ===== 모바일 코드/미리보기 탭 전환 ===== */}
      <div className="md:hidden border-b flex bg-muted/30">
        <button
          onClick={() => setMobileTab('code')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
            mobileTab === 'code'
              ? 'text-foreground border-b-2 border-primary bg-background'
              : 'text-muted-foreground'
          }`}
        >
          <Code className="h-3 w-3" />
          {locale === 'ko' ? '코드' : 'Code'}
          {selectedFileName && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
              ({selectedFileName})
            </span>
          )}
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'text-foreground border-b-2 border-primary bg-background'
              : 'text-muted-foreground'
          }`}
        >
          <Eye className="h-3 w-3" />
          {locale === 'ko' ? '미리보기' : 'Preview'}
          {showLiveAfterDeploy && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
        </button>
      </div>

      {/* ===== 메인 영역 ===== */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 모바일 파일 오버레이 */}
        {showMobileFiles && (
          <div className="absolute inset-0 z-30 md:hidden flex">
            <div className="w-64 bg-background border-r overflow-y-auto shadow-lg">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">{locale === 'ko' ? '파일' : 'Files'}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowMobileFiles(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {renderFileList()}
            </div>
            <div
              className="flex-1 bg-black/30"
              onClick={() => setShowMobileFiles(false)}
            />
          </div>
        )}

        {/* 데스크탑 파일 사이드바 */}
        <div className="hidden md:block w-48 border-r bg-muted/30 overflow-y-auto flex-shrink-0">
          {renderFileList()}
        </div>

        {/* ===== 데스크탑: 에디터 + 미리보기 가로 분할 ===== */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* 코드 에디터 */}
          <div className={`flex flex-col overflow-hidden ${showPreview ? 'w-1/2 border-r' : 'w-full'}`}>
            <div className="border-b px-3 py-1.5 flex items-center gap-2 bg-muted/20 text-xs text-muted-foreground flex-shrink-0">
              <Code className="h-3 w-3" />
              <span className="truncate">{selectedPath || ''}</span>
            </div>
            {renderEditor()}
          </div>

          {/* 미리보기 */}
          {showPreview && (
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="border-b px-3 py-1.5 flex items-center gap-2 bg-muted/20 text-xs text-muted-foreground flex-shrink-0">
                <Eye className="h-3 w-3" />
                <span>{locale === 'ko' ? '실시간 미리보기' : 'Live Preview'}</span>
                {showLiveAfterDeploy ? (
                  <Badge variant="default" className="text-[10px] px-1 py-0 ml-auto bg-green-600">
                    {locale === 'ko' ? '배포됨' : 'DEPLOYED'}
                  </Badge>
                ) : isLivePreviewable ? (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-auto">
                    LIVE
                  </Badge>
                ) : null}
              </div>
              {renderPreview()}
            </div>
          )}
        </div>

        {/* ===== 모바일: 탭 전환 방식 ===== */}
        <div className="flex md:hidden flex-1 flex-col overflow-hidden">
          {/* 코드 탭 */}
          {mobileTab === 'code' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {renderEditor()}
            </div>
          )}

          {/* 미리보기 탭 */}
          {mobileTab === 'preview' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-3 py-1.5 flex items-center gap-2 bg-muted/20 text-xs text-muted-foreground border-b flex-shrink-0">
                <Eye className="h-3 w-3" />
                <span>{locale === 'ko' ? '미리보기' : 'Preview'}</span>
                {showLiveAfterDeploy ? (
                  <Badge variant="default" className="text-[10px] px-1 py-0 ml-auto bg-green-600">
                    {locale === 'ko' ? '배포됨' : 'DEPLOYED'}
                  </Badge>
                ) : isLivePreviewable ? (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-auto">
                    LIVE
                  </Badge>
                ) : null}
              </div>
              {renderPreview()}
            </div>
          )}
        </div>
      </div>

      {/* ===== AI 챗봇 터미널 ===== */}
      <ChatTerminal
        fileContent={editorContent}
        filePath={selectedPath}
        allFiles={allFilePaths}
        onApplyCode={(code) => {
          handleContentChange(code);
        }}
        onApplyFiles={handleApplyFiles}
      />

      {/* ===== 상태 바 ===== */}
      <div className="border-t px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground bg-muted/30 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate">{selectedFileName}</span>
          <span className="text-muted-foreground/60 hidden sm:inline">
            {locale === 'ko' ? 'Ctrl+S 저장 · 배포 버튼으로 사이트 반영' : 'Ctrl+S save · Deploy to publish'}
          </span>
        </div>
        {lastSavedAt && (
          <span className="shrink-0 text-[10px] sm:text-xs">
            {lastSavedAt.toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </div>
  );
}
