export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ProjectTabs } from '@/components/project/project-tabs';
import type { Profile } from '@/types';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: project }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('projects').select('*').eq('id', id).eq('user_id', user.id).single(),
  ]);

  if (!project) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile as Profile | null} />
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <ProjectTabs projectId={id} />
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
