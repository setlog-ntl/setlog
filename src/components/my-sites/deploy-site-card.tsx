'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ExternalLink, Github, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/i18n';
import { useDeleteDeployment, type HomepageDeploy } from '@/lib/queries/oneclick';
import { toast } from 'sonner';
import Link from 'next/link';

interface DeploySiteCardProps {
  deploy: HomepageDeploy;
}

export function DeploySiteCard({ deploy }: DeploySiteCardProps) {
  const { locale } = useLocaleStore();
  const deleteMutation = useDeleteDeployment();
  const [open, setOpen] = useState(false);

  const liveUrl = deploy.pages_url || deploy.deployment_url;
  const templateName = deploy.homepage_templates
    ? (locale === 'ko' ? deploy.homepage_templates.name_ko : deploy.homepage_templates.name)
    : null;

  const statusVariant = (() => {
    switch (deploy.deploy_status) {
      case 'ready': return 'default' as const;
      case 'building': case 'creating': return 'secondary' as const;
      case 'error': return 'destructive' as const;
      default: return 'outline' as const;
    }
  })();

  const statusLabel = (() => {
    switch (deploy.deploy_status) {
      case 'ready': return locale === 'ko' ? '활성' : 'Active';
      case 'building': return locale === 'ko' ? '빌드 중' : 'Building';
      case 'creating': return locale === 'ko' ? '생성 중' : 'Creating';
      case 'error': return locale === 'ko' ? '오류' : 'Error';
      case 'canceled': return locale === 'ko' ? '취소됨' : 'Canceled';
      default: return locale === 'ko' ? '대기 중' : 'Pending';
    }
  })();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deploy.id);
      toast.success(locale === 'ko' ? '사이트가 삭제되었습니다.' : 'Site deleted.');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const deployDate = new Date(deploy.created_at).toLocaleDateString(
    locale === 'ko' ? 'ko-KR' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold truncate">{deploy.site_name}</h3>
            {templateName && (
              <p className="text-xs text-muted-foreground">
                {t(locale, 'mySites.template')}: {templateName}
              </p>
            )}
          </div>
          <Badge variant={statusVariant} className="ml-2 flex-shrink-0">
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Live URL */}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate block font-mono"
          >
            {liveUrl.replace('https://', '')}
          </a>
        )}

        {/* Deploy date */}
        <p className="text-xs text-muted-foreground">
          {t(locale, 'mySites.deployedAt')}: {deployDate}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {liveUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                {t(locale, 'mySites.visitSite')}
              </a>
            </Button>
          )}
          {deploy.forked_repo_url && (
            <Button size="sm" variant="outline" asChild>
              <a href={deploy.forked_repo_url} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1 h-3 w-3" />
                {t(locale, 'mySites.githubRepo')}
              </a>
            </Button>
          )}
          {deploy.deploy_status === 'ready' && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/my-sites/${deploy.id}/edit`}>
                <Pencil className="mr-1 h-3 w-3" />
                {t(locale, 'mySites.editSite')}
              </Link>
            </Button>
          )}

          {/* Delete */}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t(locale, 'mySites.deleteConfirm')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t(locale, 'mySites.deleteDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t(locale, 'common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t(locale, 'mySites.deleting')}
                    </>
                  ) : (
                    t(locale, 'common.delete')
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
