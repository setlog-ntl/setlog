'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search } from 'lucide-react';
import type { Service, ServiceCategory } from '@/types';

const categoryLabels: Partial<Record<ServiceCategory, string>> = {
  auth: '인증',
  database: '데이터베이스',
  deploy: '배포',
  email: '이메일',
  payment: '결제',
  storage: '스토리지',
  monitoring: '모니터링',
  ai: 'AI',
  other: '기타',
};

interface AddServiceDialogProps {
  projectId: string;
  existingServiceIds: string[];
  onAdd: (serviceId: string) => Promise<void>;
}

export function AddServiceDialog({ projectId, existingServiceIds, onAdd }: AddServiceDialogProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      supabase
        .from('services')
        .select('*')
        .order('name')
        .then(({ data }) => {
          setServices(data || []);
          setLoading(false);
        });
    }
  }, [open, supabase]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (existingServiceIds.includes(s.id)) return false;
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.description_ko?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [services, existingServiceIds, selectedCategory, search]);

  const handleAdd = async (serviceId: string) => {
    setAdding(serviceId);
    try {
      await onAdd(serviceId);
    } finally {
      setAdding(null);
    }
  };

  const categories: (ServiceCategory | 'all')[] = ['all', 'auth', 'database', 'deploy', 'email', 'payment', 'storage', 'monitoring', 'ai', 'other'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          서비스 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>서비스 카탈로그</DialogTitle>
          <DialogDescription>프로젝트에 추가할 서비스를 선택하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="서비스 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? '전체' : categoryLabels[cat]}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {search ? '검색 결과가 없습니다' : '추가할 수 있는 서비스가 없습니다'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                        {service.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{service.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {service.description_ko || service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {categoryLabels[service.category as ServiceCategory]}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(service.id)}
                        disabled={adding === service.id}
                      >
                        {adding === service.id ? '추가 중...' : '추가'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
