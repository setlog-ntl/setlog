'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, LayoutDashboard } from 'lucide-react';
import type { Profile } from '@/types';

interface HeaderProps {
  profile: Profile | null;
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Set</span>
          <span>Log</span>
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-6">
          {profile && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              대시보드
            </Link>
          )}
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            서비스 카탈로그
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || ''} />
                    <AvatarFallback>
                      {profile.name?.charAt(0)?.toUpperCase() || profile.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile.name || '사용자'}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    대시보드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">시작하기</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
