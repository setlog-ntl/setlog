-- ============================================
-- 011: Add social_login category
-- ============================================
-- Add 'social_login' to the services category CHECK constraint
-- for Kakao Login, Google OAuth, Naver Login, Apple Login, GitHub OAuth

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_category_check;

ALTER TABLE public.services ADD CONSTRAINT services_category_check
  CHECK (category IN (
    'auth', 'social_login', 'database', 'deploy', 'email', 'payment', 'storage', 'monitoring', 'ai', 'other',
    'cdn', 'cicd', 'testing', 'sms', 'push', 'chat', 'search', 'cms', 'analytics',
    'media', 'queue', 'cache', 'logging', 'feature_flags', 'scheduling', 'ecommerce',
    'serverless', 'code_quality', 'automation'
  ));
