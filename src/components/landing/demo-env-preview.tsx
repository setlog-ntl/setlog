'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { TypingAnimation } from './typing-animation';

const ENV_LINES = [
  '# Supabase',
  'NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co',
  'SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...',
  '',
  '# Stripe',
  'STRIPE_SECRET_KEY=sk_live_51Abc...',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...',
  '',
  '# OpenAI',
  'OPENAI_API_KEY=sk-proj-abc123...',
];

export function DemoEnvPreview() {
  const [showSecrets, setShowSecrets] = useState(false);

  const maskedLines = ENV_LINES.map((line) => {
    if (!showSecrets && line.includes('=') && !line.startsWith('#') && !line.startsWith('NEXT_PUBLIC_SUPABASE_URL')) {
      const [key] = line.split('=');
      return `${key}=${'•'.repeat(24)}`;
    }
    return line;
  });

  return (
    <div className="rounded-xl border bg-gray-950 text-gray-100 overflow-hidden h-full">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-400 ml-2 font-mono">.env.local</span>
        </div>
        <button
          onClick={() => setShowSecrets(!showSecrets)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showSecrets ? '숨기기' : '보기'}
        </button>
      </div>

      {/* Code content */}
      <div className="p-4 font-mono text-xs leading-relaxed overflow-hidden">
        <TypingAnimation
          lines={maskedLines}
          typingSpeed={15}
          lineDelay={200}
          className="min-h-[180px]"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 border-t border-gray-800 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>AES-256-GCM 암호화</span>
      </div>
    </div>
  );
}
