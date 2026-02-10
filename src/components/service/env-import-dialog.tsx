'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import type { Environment } from '@/types';

interface ParsedEnvVar {
  key: string;
  value: string;
}

interface EnvImportDialogProps {
  onImport: (vars: { key_name: string; value: string; environment: string; is_secret: boolean }[]) => Promise<void>;
}

function parseEnvContent(content: string): ParsedEnvVar[] {
  const lines = content.split('\n');
  const vars: ParsedEnvVar[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Validate key format
    if (/^[A-Z][A-Z0-9_]*$/.test(key)) {
      vars.push({ key, value });
    }
  }

  return vars;
}

export function EnvImportDialog({ onImport }: EnvImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [environment, setEnvironment] = useState<Environment>('development');
  const [importing, setImporting] = useState(false);

  const parsed = useMemo(() => parseEnvContent(content), [content]);

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setImporting(true);
    try {
      const vars = parsed.map((v) => ({
        key_name: v.key,
        value: v.value,
        environment,
        is_secret: !v.key.startsWith('NEXT_PUBLIC_'),
      }));
      await onImport(vars);
      setOpen(false);
      setContent('');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          .env 가져오기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>.env 파일 일괄 가져오기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as Environment)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">개발 (Development)</SelectItem>
                <SelectItem value="staging">스테이징 (Staging)</SelectItem>
                <SelectItem value="production">프로덕션 (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder={`# .env 파일 내용을 붙여넣으세요\nNEXT_PUBLIC_API_URL=https://api.example.com\nAPI_SECRET_KEY=sk_live_...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />

          {parsed.length > 0 && (
            <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2">
                {parsed.length}개 변수 감지됨
              </p>
              <div className="space-y-1">
                {parsed.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <code className="font-mono bg-muted px-1 py-0.5 rounded truncate">
                      {v.key}
                    </code>
                    <Badge
                      variant={v.key.startsWith('NEXT_PUBLIC_') ? 'secondary' : 'destructive'}
                      className="text-[9px] shrink-0"
                    >
                      {v.key.startsWith('NEXT_PUBLIC_') ? '공개' : '비밀'}
                    </Badge>
                    <span className="text-muted-foreground truncate">
                      {v.key.startsWith('NEXT_PUBLIC_')
                        ? `${v.value.substring(0, 20)}${v.value.length > 20 ? '...' : ''}`
                        : '••••••'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleImport} disabled={importing || parsed.length === 0}>
            {importing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {parsed.length}개 가져오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
