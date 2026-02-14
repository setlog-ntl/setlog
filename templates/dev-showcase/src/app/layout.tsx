import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { siteConfig } from '@/lib/config';
import { LocaleProvider } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: `${siteConfig.name} - 개발자 포트폴리오`,
  description: siteConfig.tagline,
  openGraph: {
    title: `${siteConfig.name} - 개발자 포트폴리오`,
    description: siteConfig.tagline,
    type: 'website',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - 개발자 포트폴리오`,
    description: siteConfig.tagline,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: siteConfig.name,
              description: siteConfig.tagline,
              ...(siteConfig.email ? { email: siteConfig.email } : {}),
              ...(siteConfig.githubUsername
                ? { sameAs: [`https://github.com/${siteConfig.githubUsername}`] }
                : {}),
            }),
          }}
        />
      </head>
      <body className="antialiased bg-gray-950 text-gray-50 dark:bg-gray-950 dark:text-gray-50">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
