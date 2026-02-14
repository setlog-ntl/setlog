import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { siteConfig } from '@/lib/config';
import { LocaleProvider } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: `${siteConfig.name} - 디지털 명함`,
  description: `${siteConfig.name} | ${siteConfig.title}`,
  openGraph: {
    title: `${siteConfig.name} - 디지털 명함`,
    description: `${siteConfig.name} | ${siteConfig.title}`,
    type: 'website',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - 디지털 명함`,
    description: `${siteConfig.name} | ${siteConfig.title}`,
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
              jobTitle: siteConfig.title,
              ...(siteConfig.company ? { worksFor: { '@type': 'Organization', name: siteConfig.company } } : {}),
              ...(siteConfig.email ? { email: siteConfig.email } : {}),
              ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
              ...(siteConfig.website ? { url: siteConfig.website } : {}),
            }),
          }}
        />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
