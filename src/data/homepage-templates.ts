export interface HomepageTemplateSeed {
  id: string;
  slug: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  preview_image_url: string | null;
  github_owner: string;
  github_repo: string;
  default_branch: string;
  framework: string;
  required_env_vars: Array<{ key: string; description: string; required: boolean }>;
  tags: string[];
  is_premium: boolean;
  is_active: boolean;
  display_order: number;
}

// Fixed UUIDs for idempotent seeding
const TEMPLATE_IDS = {
  MINIMAL_PORTFOLIO: 'b2c3d4e5-0001-4000-9000-000000000001',
  LINK_PAGE: 'b2c3d4e5-0002-4000-9000-000000000002',
};

export const homepageTemplates: HomepageTemplateSeed[] = [
  {
    id: TEMPLATE_IDS.MINIMAL_PORTFOLIO,
    slug: 'homepage-minimal',
    name: 'Minimal Portfolio',
    name_ko: '미니멀 포트폴리오',
    description: 'Clean, single-page portfolio with dark mode support. Built with Next.js and Tailwind CSS.',
    description_ko: '깔끔한 1페이지 포트폴리오 사이트. 다크모드 지원. Next.js + Tailwind CSS.',
    preview_image_url: null,
    github_owner: 'linkmap-templates',
    github_repo: 'homepage-minimal',
    default_branch: 'main',
    framework: 'nextjs',
    required_env_vars: [
      { key: 'NEXT_PUBLIC_SITE_NAME', description: '사이트 이름', required: true },
      { key: 'NEXT_PUBLIC_SITE_DESCRIPTION', description: '사이트 설명', required: false },
      { key: 'NEXT_PUBLIC_AUTHOR_NAME', description: '작성자 이름', required: false },
    ],
    tags: ['portfolio', 'minimal', 'dark-mode', 'nextjs'],
    is_premium: false,
    is_active: true,
    display_order: 1,
  },
  {
    id: TEMPLATE_IDS.LINK_PAGE,
    slug: 'homepage-links',
    name: 'Link Page',
    name_ko: '링크 모음',
    description: 'A Linktree alternative. Customizable link page with social icons. Own your links with your code.',
    description_ko: 'Linktree 대안 링크 페이지. 소셜 아이콘과 커스터마이징 지원. 내 코드로 내 링크를 관리.',
    preview_image_url: null,
    github_owner: 'linkmap-templates',
    github_repo: 'homepage-links',
    default_branch: 'main',
    framework: 'nextjs',
    required_env_vars: [
      { key: 'NEXT_PUBLIC_SITE_NAME', description: '사이트 이름', required: true },
      { key: 'NEXT_PUBLIC_BIO', description: '소개 문구', required: false },
    ],
    tags: ['links', 'linktree', 'social', 'nextjs'],
    is_premium: false,
    is_active: true,
    display_order: 2,
  },
];
