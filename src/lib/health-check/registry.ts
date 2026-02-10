import type { HealthCheckAdapter } from './types';
import { openaiAdapter } from './adapters/openai';
import { anthropicAdapter } from './adapters/anthropic';
import { stripeAdapter } from './adapters/stripe';
import { supabaseAdapter } from './adapters/supabase';
import { clerkAdapter } from './adapters/clerk';
import { resendAdapter } from './adapters/resend';
import { vercelAdapter } from './adapters/vercel';
import { sentryAdapter } from './adapters/sentry';
import { createGenericAdapter } from './adapters/generic';

const adapters: Map<string, HealthCheckAdapter> = new Map();

// Register built-in adapters
const builtInAdapters: HealthCheckAdapter[] = [
  openaiAdapter,
  anthropicAdapter,
  stripeAdapter,
  supabaseAdapter,
  clerkAdapter,
  resendAdapter,
  vercelAdapter,
  sentryAdapter,
];

for (const adapter of builtInAdapters) {
  adapters.set(adapter.serviceSlug, adapter);
}

export function getAdapter(slug: string): HealthCheckAdapter | null {
  return adapters.get(slug) || null;
}

export function getOrCreateAdapter(
  slug: string,
  requiredEnvVarNames: string[]
): HealthCheckAdapter {
  const existing = adapters.get(slug);
  if (existing) return existing;
  return createGenericAdapter(slug, requiredEnvVarNames);
}

export function listAdapters(): string[] {
  return Array.from(adapters.keys());
}
