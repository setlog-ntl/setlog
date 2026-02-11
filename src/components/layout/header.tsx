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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, Settings, LayoutDashboard, Menu, Globe } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useLocaleStore } from '@/stores/locale-store';
import { t, localeNames } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { Profile } from '@/types';

interface HeaderProps {
  profile: Profile | null;
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { locale, setLocale } = useLocaleStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = (
    <>
      {profile && (
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          {t(locale, 'common.dashboard')}
        </Link>
      )}
      <Link
        href="/services"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setSidebarOpen(false)}
      >
        {t(locale, 'nav.serviceCatalog')}
      </Link>
      <Link
        href="/packages"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setSidebarOpen(false)}
      >
        패키지
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Link</span>
          <span>map</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-8 hidden md:flex items-center gap-6">
          {navLinks}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(localeNames) as Locale[]).map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={locale === loc ? 'font-bold' : ''}
                >
                  {localeNames[loc]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

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
                    <p className="text-sm font-medium">{profile.name || t(locale, 'common.home')}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t(locale, 'common.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t(locale, 'common.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t(locale, 'common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">{t(locale, 'common.login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t(locale, 'common.signup')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks}
                {!profile && (
                  <>
                    <Link href="/login" className="text-sm font-medium" onClick={() => setSidebarOpen(false)}>
                      {t(locale, 'common.login')}
                    </Link>
                    <Link href="/signup" className="text-sm font-medium" onClick={() => setSidebarOpen(false)}>
                      {t(locale, 'common.signup')}
                    </Link>
                  </>
                )}
                {profile && (
                  <button
                    onClick={() => { handleSignOut(); setSidebarOpen(false); }}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground text-left"
                  >
                    {t(locale, 'common.logout')}
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
