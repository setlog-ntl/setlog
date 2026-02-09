'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Project, ProjectWithServices } from '@/types';

export function useProjects() {
  const supabase = createClient();
  const [projects, setProjects] = useState<ProjectWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_services (
          *,
          service:services (*)
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string, description?: string, techStack?: Record<string, string>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        tech_stack: techStack || {},
      })
      .select()
      .single();

    if (error) throw error;
    await fetchProjects();
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    await fetchProjects();
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'tech_stack'>>) => {
    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await fetchProjects();
  };

  return { projects, loading, error, createProject, deleteProject, updateProject, refetch: fetchProjects };
}
