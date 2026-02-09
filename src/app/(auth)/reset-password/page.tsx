'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>이메일을 확인해주세요</CardTitle>
            <CardDescription>
              {email}로 비밀번호 재설정 링크를 보냈습니다.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                로그인으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>비밀번호 재설정</CardTitle>
          <CardDescription>가입한 이메일 주소를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인으로 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
