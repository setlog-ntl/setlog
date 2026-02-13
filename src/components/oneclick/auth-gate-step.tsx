'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Github, Loader2, LogIn } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google-icon';
import { useLocaleStore } from '@/stores/locale-store';

export function AuthGateStep() {
  const { locale } = useLocaleStore();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? locale === 'ko'
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : 'Invalid email or password.'
          : error.message
      );
      setLoading(false);
      return;
    }

    // Refresh the server component to re-evaluate auth state
    router.refresh();
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/oneclick`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  };

  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <LogIn className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              {locale === 'ko' ? '로그인이 필요합니다' : 'Sign In Required'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {locale === 'ko'
                ? '홈페이지를 배포하려면 먼저 로그인하세요. 계정이 없으면 자동으로 생성됩니다.'
                : 'Sign in to deploy your homepage. An account will be created automatically if needed.'}
            </p>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null || loading}
                className="w-full"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('github')}
                disabled={oauthLoading !== null || loading}
                className="w-full"
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {locale === 'ko' ? '또는' : 'or'}
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="oneclick-email" className="text-left block">
                  {locale === 'ko' ? '이메일' : 'Email'}
                </Label>
                <Input
                  id="oneclick-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oneclick-password" className="text-left block">
                  {locale === 'ko' ? '비밀번호' : 'Password'}
                </Label>
                <Input
                  id="oneclick-password"
                  type="password"
                  placeholder={locale === 'ko' ? '비밀번호를 입력하세요' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading || oauthLoading !== null}>
                {loading
                  ? locale === 'ko' ? '로그인 중...' : 'Signing in...'
                  : locale === 'ko' ? '로그인' : 'Sign In'}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              {locale === 'ko' ? '계정이 없으신가요?' : "Don't have an account?"}{' '}
              <Link href="/signup?redirect=/oneclick" className="text-primary hover:underline font-medium">
                {locale === 'ko' ? '회원가입' : 'Sign Up'}
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
