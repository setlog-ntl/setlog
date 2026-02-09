export interface TemplateSeed {
  id: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  services: string[];
  tech_stack: Record<string, string>;
  is_community: boolean;
  author_id: null;
  downloads_count: number;
}

export const templates: TemplateSeed[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    name: 'SaaS \uC2A4\uD0C0\uD130',
    name_ko: 'SaaS \uC2A4\uD0C0\uD130',
    description:
      '\uC778\uC99D, \uB370\uC774\uD130\uBCA0\uC774\uC2A4, \uACB0\uC81C, \uD2B8\uB79C\uC7AD\uC158 \uC774\uBA54\uC77C, \uBC30\uD3EC\uAC00 \uBBF8\uB9AC \uAD6C\uC131\uB41C \uD480\uC2A4\uD0DD SaaS \uBCF4\uC77C\uB7EC\uD50C\uB808\uC774\uD2B8\uC785\uB2C8\uB2E4.',
    description_ko:
      '\uC778\uC99D, \uB370\uC774\uD130\uBCA0\uC774\uC2A4, \uACB0\uC81C, \uD2B8\uB79C\uC7AD\uC158 \uC774\uBA54\uC77C, \uBC30\uD3EC\uAC00 \uBBF8\uB9AC \uAD6C\uC131\uB41C \uD480\uC2A4\uD0DD SaaS \uBCF4\uC77C\uB7EC\uD50C\uB808\uC774\uD2B8\uC785\uB2C8\uB2E4.',
    services: ['nextjs', 'supabase', 'stripe', 'resend', 'vercel'],
    tech_stack: {
      framework: 'nextjs',
      language: 'typescript',
    },
    is_community: false,
    author_id: null,
    downloads_count: 0,
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    name: '\uBE14\uB85C\uADF8/\uD3EC\uD2B8\uD3F4\uB9AC\uC624',
    name_ko: '\uBE14\uB85C\uADF8/\uD3EC\uD2B8\uD3F4\uB9AC\uC624',
    description:
      '\uC774\uBBF8\uC9C0 \uCD5C\uC801\uD654\uC640 \uBE60\uB978 \uAE00\uB85C\uBC8C \uC804\uC1A1\uC744 \uC9C0\uC6D0\uD558\uB294 \uACBD\uB7C9 \uBE14\uB85C\uADF8 \uBC0F \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uC0AC\uC774\uD2B8\uC785\uB2C8\uB2E4.',
    description_ko:
      '\uC774\uBBF8\uC9C0 \uCD5C\uC801\uD654\uC640 \uBE60\uB978 \uAE00\uB85C\uBC8C \uC804\uC1A1\uC744 \uC9C0\uC6D0\uD558\uB294 \uACBD\uB7C9 \uBE14\uB85C\uADF8 \uBC0F \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uC0AC\uC774\uD2B8\uC785\uB2C8\uB2E4.',
    services: ['nextjs', 'vercel', 'cloudinary'],
    tech_stack: {
      framework: 'nextjs',
      language: 'typescript',
    },
    is_community: false,
    author_id: null,
    downloads_count: 0,
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    name: 'AI \uC571',
    name_ko: 'AI \uC571',
    description:
      '\uBA40\uD2F0 \uD504\uB85C\uBC14\uC774\uB354 LLM \uC9C0\uC6D0, \uC601\uAD6C \uC800\uC7A5\uC18C, \uD504\uB85C\uB355\uC158 \uBC30\uD3EC\uAC00 \uD3EC\uD568\uB41C AI \uAE30\uBC18 \uC560\uD50C\uB9AC\uCF00\uC774\uC158 \uD15C\uD50C\uB9BF\uC785\uB2C8\uB2E4.',
    description_ko:
      '\uBA40\uD2F0 \uD504\uB85C\uBC14\uC774\uB354 LLM \uC9C0\uC6D0, \uC601\uAD6C \uC800\uC7A5\uC18C, \uD504\uB85C\uB355\uC158 \uBC30\uD3EC\uAC00 \uD3EC\uD568\uB41C AI \uAE30\uBC18 \uC560\uD50C\uB9AC\uCF00\uC774\uC158 \uD15C\uD50C\uB9BF\uC785\uB2C8\uB2E4.',
    services: ['nextjs', 'openai', 'anthropic', 'supabase', 'vercel'],
    tech_stack: {
      framework: 'nextjs',
      language: 'typescript',
    },
    is_community: false,
    author_id: null,
    downloads_count: 0,
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    name: '\uBAA8\uBC14\uC77C \uC571 \uBC31\uC5D4\uB4DC',
    name_ko: '\uBAA8\uBC14\uC77C \uC571 \uBC31\uC5D4\uB4DC',
    description:
      '\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uBCA0\uC774\uC2A4, \uD478\uC2DC \uC54C\uB9BC, \uC5D0\uB7EC \uCD94\uC801\uC744 \uC9C0\uC6D0\uD558\uB294 \uBAA8\uBC14\uC77C \uC571\uC6A9 \uBC31\uC5D4\uB4DC \uC778\uD504\uB77C \uD15C\uD50C\uB9BF\uC785\uB2C8\uB2E4.',
    description_ko:
      '\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uBCA0\uC774\uC2A4, \uD478\uC2DC \uC54C\uB9BC, \uC5D0\uB7EC \uCD94\uC801\uC744 \uC9C0\uC6D0\uD558\uB294 \uBAA8\uBC14\uC77C \uC571\uC6A9 \uBC31\uC5D4\uB4DC \uC778\uD504\uB77C \uD15C\uD50C\uB9BF\uC785\uB2C8\uB2E4.',
    services: ['supabase', 'firebase', 'sentry'],
    tech_stack: {
      framework: 'react-native',
      language: 'typescript',
    },
    is_community: false,
    author_id: null,
    downloads_count: 0,
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    name: '\uB79C\uB529\uD398\uC774\uC9C0',
    name_ko: '\uB79C\uB529\uD398\uC774\uC9C0',
    description:
      '\uBB38\uC758 \uD3FC \uC774\uBA54\uC77C \uBC1C\uC1A1\uACFC \uBE60\uB978 \uAE00\uB85C\uBC8C \uBC30\uD3EC\uB97C \uC9C0\uC6D0\uD558\uB294 \uACE0\uC804\uD658 \uB79C\uB529\uD398\uC774\uC9C0 \uD15C\uD50C\uB9BF\uC785\uB2C8\uB2E4.',
    description_ko:
      '\uBB38\uC758 \uD3FC \uC774\uBA54\uC77C \uBC1C\uC1A1\uACFC \uBE60\uB978 \uAE00\uB85C\uBC8C \uBC30\uD3EC\uB97C \uC9C0\uC6D0\uD558\uB294 \uACE0\uC804\uD658 \uB79C\uB529\uD398\uC774\uC9C0 \uD15C\uD50C\uB9BF\uC785\uB2C8\uB2E4.',
    services: ['nextjs', 'resend', 'vercel'],
    tech_stack: {
      framework: 'nextjs',
      language: 'typescript',
    },
    is_community: false,
    author_id: null,
    downloads_count: 0,
  },
];
