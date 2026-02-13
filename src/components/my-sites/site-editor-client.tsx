'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Loader2,
  FileText,
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

export function SiteEditorClient({ deployId }: SiteEditorClientProps) {
  const { locale } = useLocaleStore();
  const { data: files, isLoading: filesLoading } = useDeployFiles(deployId);
  const { data: deployments } = useMyDeployments();
  const updateFile = useUpdateFile();

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const { data: fileDetail, isLoading: contentLoading } = useFileContent(
    deployId,
    selectedPath
  );

  const deploy = deployments?.find((d) => d.id === deployId);
  const liveUrl = deploy?.pages_url || deploy?.deployment_url;

  // Auto-select first file
  useEffect(() => {
    if (files && files.length > 0 && !selectedPath) {
      setSelectedPath(files[0].path);
    }
  }, [files, selectedPath]);

  // Sync file content to editor
  useEffect(() => {
    if (fileDetail) {
      setEditorContent(fileDetail.content);
      setHasUnsavedChanges(false);
    }
  }, [fileDetail]);

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
      // Update the sha in-place so the next save uses the new sha
      fileDetail.sha = result.sha;
      toast.success(t(locale, 'editor.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장 실패');
    }
  }, [selectedPath, fileDetail, editorContent, deployId, updateFile, locale]);

  // Warn on page leave
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
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
          {liveUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                {t(locale, 'editor.preview')}
              </a>
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || updateFile.isPending}
          >
            {updateFile.isPending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                {t(locale, 'editor.saving')}
              </>
            ) : (
              <>
                <Save className="mr-1 h-3 w-3" />
                {t(locale, 'editor.save')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File sidebar */}
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

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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

          {/* Status bar */}
          <div className="border-t px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
            <span>{selectedPath || ''}</span>
            {lastSavedAt && (
              <span>
                {t(locale, 'editor.lastSaved')}:{' '}
                {lastSavedAt.toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
