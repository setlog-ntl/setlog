'use client';

import { useMyDeployments } from '@/lib/queries/oneclick';
import { DeploySiteCard } from './deploy-site-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Rocket, Monitor } from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/i18n';
import Link from 'next/link';

export function MySitesClient() {
  const { locale } = useLocaleStore();
  const { data: deployments, isLoading, error } = useMyDeployments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            {t(locale, 'mySites.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(locale, 'mySites.subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link href="/oneclick">
            <Rocket className="mr-2 h-4 w-4" />
            {t(locale, 'nav.oneclick')}
          </Link>
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && deployments?.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">
            {t(locale, 'mySites.empty')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t(locale, 'mySites.emptyDesc')}
          </p>
          <Button asChild>
            <Link href="/oneclick">
              <Rocket className="mr-2 h-4 w-4" />
              {t(locale, 'mySites.createFirst')}
            </Link>
          </Button>
        </div>
      )}

      {/* Sites grid */}
      {!isLoading && deployments && deployments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deployments.map((deploy) => (
            <DeploySiteCard key={deploy.id} deploy={deploy} />
          ))}
        </div>
      )}
    </div>
  );
}
