import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import type { ThemePreset } from '@/lib/themes';

interface Props {
  theme: ThemePreset;
}

export function Footer({ theme }: Props) {
  return (
    <footer
      className="flex items-center gap-2 pt-8 text-xs"
      style={{ color: theme.textMuted }}
    >
      <span>
        Powered by{' '}
        <a
          href="https://linkmap.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          Linkmap
        </a>
      </span>
      <LanguageToggle theme={theme} />
      <ThemeToggle />
    </footer>
  );
}
