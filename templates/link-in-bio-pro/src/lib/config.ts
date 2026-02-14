export interface LinkItem {
  title: string;
  titleEn?: string;
  url: string;
  icon?: string;
}

export interface SocialItem {
  platform: string;
  url: string;
}

const DEMO_LINKS: LinkItem[] = [
  { title: '내 유튜브 채널', titleEn: 'My YouTube Channel', url: 'https://youtube.com', icon: 'youtube' },
  { title: '블로그 구경하기', titleEn: 'Visit My Blog', url: 'https://blog.example.com', icon: 'pen-line' },
  { title: '포트폴리오', titleEn: 'Portfolio', url: 'https://portfolio.example.com', icon: 'briefcase' },
  { title: '할인 이벤트 바로가기', titleEn: 'Special Offers', url: 'https://shop.example.com', icon: 'shopping-bag' },
];

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const siteConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || '내 링크 페이지',
  siteNameEn: process.env.NEXT_PUBLIC_SITE_NAME_EN || 'My Link Page',
  bio: process.env.NEXT_PUBLIC_BIO || '안녕하세요! 여기서 저의 모든 링크를 확인하세요.',
  bioEn: process.env.NEXT_PUBLIC_BIO_EN || 'Hello! Check out all my links here.',
  avatarUrl: process.env.NEXT_PUBLIC_AVATAR_URL || null,
  theme: process.env.NEXT_PUBLIC_THEME || 'gradient',
  links: parseJSON<LinkItem[]>(process.env.NEXT_PUBLIC_LINKS, DEMO_LINKS),
  socials: parseJSON<SocialItem[]>(process.env.NEXT_PUBLIC_SOCIALS, []),
  youtubeUrl: process.env.NEXT_PUBLIC_YOUTUBE_URL || null,
  gaId: process.env.NEXT_PUBLIC_GA_ID || null,
};

export type SiteConfig = typeof siteConfig;
