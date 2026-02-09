'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import type { EnvironmentVariable, Environment } from '@/types';

const envLabels: Record<Environment, string> = {
  development: '개발',
  staging: '스테이징',
  production: '프로덕션',
};

export default function ProjectEnvPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEnv, setActiveEnv] = useState<Environment>('development');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsSecret, setNewIsSecret] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  const fetchEnvVars = useCallback(async () => {
    const { data } = await supabase
      .from('environment_variables')
      .select('*')
      .eq('project_id', projectId)
      .order('key_name');
    setEnvVars(data || []);
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    fetchEnvVars();
  }, [fetchEnvVars]);

  const filteredVars = envVars.filter((v) => v.environment === activeEnv);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setAddLoading(true);

    try {
      const res = await fetch('/api/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          key_name: newKey.trim(),
          value: newValue,
          environment: activeEnv,
          is_secret: newIsSecret,
          description: newDesc.trim() || null,
        }),
      });

      if (res.ok) {
        setAddOpen(false);
        setNewKey('');
        setNewValue('');
        setNewDesc('');
        setNewIsSecret(true);
        await fetchEnvVars();
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 환경변수를 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/env?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchEnvVars();
    }
  };

  const handleDownload = () => {
    window.open(`/api/env/download?project_id=${projectId}&environment=${activeEnv}`, '_blank');
  };

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskValue = (value: string) => {
    return '•'.repeat(Math.min(value.length || 20, 30));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">환경변수 관리</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            .env 다운로드
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                변수 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>환경변수 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="env-key">변수 이름</Label>
                  <Input
                    id="env-key"
                    placeholder="NEXT_PUBLIC_EXAMPLE_KEY"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env-value">값</Label>
                  <Input
                    id="env-value"
                    placeholder="sk_live_..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env-desc">설명 (선택)</Label>
                  <Input
                    id="env-desc"
                    placeholder="Supabase Project URL"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="env-secret"
                    checked={newIsSecret}
                    onCheckedChange={(checked) => setNewIsSecret(checked as boolean)}
                  />
                  <Label htmlFor="env-secret" className="text-sm">
                    민감한 값 (Secret)
                  </Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={addLoading || !newKey.trim()}>
                    {addLoading ? '추가 중...' : '추가'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeEnv} onValueChange={(v) => setActiveEnv(v as Environment)}>
        <TabsList>
          {(Object.keys(envLabels) as Environment[]).map((env) => {
            const count = envVars.filter((v) => v.environment === env).length;
            return (
              <TabsTrigger key={env} value={env}>
                {envLabels[env]}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(envLabels) as Environment[]).map((env) => (
          <TabsContent key={env} value={env}>
            {filteredVars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {env} 환경에 등록된 변수가 없습니다
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredVars.map((envVar) => (
                      <div key={envVar.id} className="flex items-center gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono font-medium">
                              {envVar.key_name}
                            </code>
                            <Badge
                              variant={envVar.is_secret ? 'destructive' : 'secondary'}
                              className="text-[10px]"
                            >
                              {envVar.is_secret ? '비밀' : '공개'}
                            </Badge>
                          </div>
                          {envVar.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {envVar.description}
                            </p>
                          )}
                          <code className="text-xs text-muted-foreground font-mono mt-1 block">
                            {showValues[envVar.id]
                              ? envVar.encrypted_value.substring(0, 50) + '...'
                              : maskValue(envVar.encrypted_value)}
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleShowValue(envVar.id)}
                          >
                            {showValues[envVar.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(envVar.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
