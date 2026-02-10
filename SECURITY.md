# Security

## Encryption
- Environment variables are encrypted using AES-256-GCM
- Each value gets a unique 16-byte IV
- Auth tags ensure data integrity
- Keys are 32 bytes (64 hex chars) stored in `ENCRYPTION_KEY` env var
- Format: `iv:authTag:encryptedData` (hex encoded)

## Authentication
- Supabase Auth with email/password and OAuth (Google, GitHub)
- Session management via middleware (cookie-based)
- Protected routes redirect to login

## Authorization
- Row-Level Security (RLS) on all tables
- Users can only access their own data
- Project ownership verified before env var operations
- Team access via team_members join

## Rate Limiting
- In-memory rate limiter (30 req/min per user)
- Applied to sensitive API routes (env vars, decrypt)

## Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (no camera/mic/geo)
- poweredByHeader: false

## Audit Logging
- All env var operations logged (create, update, delete, decrypt); project create/update/delete are also logged.
- Logs include user_id, action, resource_type, resource_id, details (JSONB), ip_address (optional), created_at.
- Insert is performed with the service role client (`createAdminClient()`) so RLS allows writes regardless of session. See `src/lib/supabase/admin.ts` and `src/lib/audit.ts`.
- Retention: Define a retention policy for audit_logs (e.g. 90 days or 1 year). ip_address and details may contain PII; comply with your privacy policy.

## API Tokens (MCP/CLI)
- Only the hash of the token is stored (`api_tokens.token_hash`). Raw token is shown once at creation and never stored.
- Hash algorithm: SHA-256, output hex-encoded. See `hashToken()` in `src/app/api/tokens/route.ts`. Use the same algorithm when verifying tokens (e.g. in MCP server or CLI).
- Tokens may have an optional expiry (`expires_at`). Validate expiry on each use.

## Environment and Key Management
- Use separate Supabase projects and separate `ENCRYPTION_KEY` per environment (local, staging, production) so a key leak in one environment does not compromise others.
- Rotating `ENCRYPTION_KEY`: Existing `environment_variables.encrypted_value` must be re-encrypted with the new key; plan a migration or background job. Prefer documenting the rotation procedure before the need arises.
- Never commit `.env*` or `.mcp.json` (they are in `.gitignore`). Use `.env.local.example` for required variable names only.

## Reporting Vulnerabilities
If you discover a security vulnerability, please report it responsibly.
