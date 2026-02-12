'use client';

import dynamic from 'next/dynamic';

const OneclickWizardClient = dynamic(
  () => import('./wizard-client').then((m) => m.OneclickWizardClient),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
        <div className="text-center space-y-2">
          <div className="h-6 w-24 bg-muted rounded mx-auto" />
          <div className="h-10 w-80 bg-muted rounded mx-auto" />
          <div className="h-5 w-64 bg-muted rounded mx-auto" />
        </div>
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    ),
  }
);

export function OneclickPageClient() {
  return <OneclickWizardClient />;
}
