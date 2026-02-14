import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';

export function Footer() {
  return (
    <footer className="print-hide flex items-center justify-center gap-2 text-gray-400 text-xs mt-8 pb-4">
      <span>
        Powered by{' '}
        <a
          href="https://linkmap.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Linkmap
        </a>
      </span>
      <LanguageToggle />
      <ThemeToggle />
    </footer>
  );
}
