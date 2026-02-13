-- Remove free deploy limit: allow unlimited homepage deploys for free plan
UPDATE plan_quotas SET max_homepage_deploys = 999999 WHERE plan = 'free';
