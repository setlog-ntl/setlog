'use client';

import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/project/project-card';
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { TemplateDialog } from '@/components/project/template-dialog';
import { createClient } from '@/lib/supabase/client';
import { FolderOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { projects, loading, createProject, deleteProject } = useProjects();

  const handleCreateProject = async (name: string, description?: string) => {
    const project = await createProject(name, description);
    if (project) {
      router.push(`/project/${project.id}`);
    }
  };

  const handleCreateFromTemplate = async (name: string, templateId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get template data
    const { data: template } = await supabase
      .from('project_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) return;

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description: template.description_ko || template.description,
        tech_stack: template.tech_stack || {},
      })
      .select()
      .single();

    if (error || !project) return;

    // Add services from template
    const serviceSlugs = template.services as string[];
    if (serviceSlugs.length > 0) {
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .in('slug', serviceSlugs);

      if (services && services.length > 0) {
        await supabase.from('project_services').insert(
          services.map((s) => ({
            project_id: project.id,
            service_id: s.id,
            status: 'not_started',
          }))
        );
      }
    }

    // Increment template download count
    await supabase.rpc('increment_template_downloads', { template_id: templateId });

    router.push(`/project/${project.id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await deleteProject(id);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">내 프로젝트</h1>
          <p className="text-muted-foreground mt-1">
            프로젝트를 생성하고 서비스 연결을 관리하세요
          </p>
        </div>
        <div className="flex gap-3">
          <TemplateDialog onSubmit={handleCreateFromTemplate} />
          <CreateProjectDialog onSubmit={handleCreateProject} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">프로젝트가 없습니다</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            새 프로젝트를 만들거나 템플릿에서 시작하여
            서비스 연결을 관리해보세요.
          </p>
          <div className="flex gap-3">
            <TemplateDialog onSubmit={handleCreateFromTemplate} />
            <CreateProjectDialog onSubmit={handleCreateProject} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
