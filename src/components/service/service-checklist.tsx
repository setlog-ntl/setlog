'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { ChecklistItem, UserChecklistProgress } from '@/types';

interface ServiceChecklistProps {
  projectServiceId: string;
  serviceId: string;
}

export function ServiceChecklist({ projectServiceId, serviceId }: ServiceChecklistProps) {
  const supabase = createClient();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: checklistItems }, { data: progressData }] = await Promise.all([
        supabase
          .from('checklist_items')
          .select('*')
          .eq('service_id', serviceId)
          .order('order_index'),
        supabase
          .from('user_checklist_progress')
          .select('*')
          .eq('project_service_id', projectServiceId),
      ]);

      setItems(checklistItems || []);

      const progressMap: Record<string, boolean> = {};
      (progressData || []).forEach((p: UserChecklistProgress) => {
        progressMap[p.checklist_item_id] = p.completed;
      });
      setProgress(progressMap);
      setLoading(false);
    };
    fetchData();
  }, [projectServiceId, serviceId, supabase]);

  const handleToggle = async (itemId: string, checked: boolean) => {
    setProgress((prev) => ({ ...prev, [itemId]: checked }));

    const { data: existing } = await supabase
      .from('user_checklist_progress')
      .select('id')
      .eq('project_service_id', projectServiceId)
      .eq('checklist_item_id', itemId)
      .single();

    if (existing) {
      await supabase
        .from('user_checklist_progress')
        .update({
          completed: checked,
          completed_at: checked ? new Date().toISOString() : null,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_checklist_progress').insert({
        project_service_id: projectServiceId,
        checklist_item_id: itemId,
        completed: checked,
        completed_at: checked ? new Date().toISOString() : null,
      });
    }

    // Update project_service status based on progress
    const completedCount = Object.values({ ...progress, [itemId]: checked }).filter(Boolean).length;
    const totalCount = items.length;

    let status = 'not_started';
    if (completedCount === totalCount && totalCount > 0) {
      status = 'connected';
    } else if (completedCount > 0) {
      status = 'in_progress';
    }

    await supabase
      .from('project_services')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', projectServiceId);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        체크리스트 항목이 아직 없습니다.
      </p>
    );
  }

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {completedCount}/{items.length} 완료
        </Badge>
      </div>

      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={item.id}
              checked={progress[item.id] || false}
              onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <label
                htmlFor={item.id}
                className={`text-sm font-medium cursor-pointer ${
                  progress[item.id] ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {index + 1}. {item.title_ko || item.title}
              </label>
              {(item.description_ko || item.description) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description_ko || item.description}
                </p>
              )}
            </div>
            {item.guide_url && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                <a href={item.guide_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
