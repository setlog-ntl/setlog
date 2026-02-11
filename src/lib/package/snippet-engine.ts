import type { CodeSnippet, PackageEnvVar } from '@/types/package';

/**
 * 스니펫 적용 결과
 */
export interface SnippetApplyResult {
  created: string[];
  skipped: string[];
  conflicts: string[];
  env_example_entries: string[];
}

/**
 * 코드 스니펫 충돌 분석 (웹 UI용 — 실제 파일 시스템 접근 없음)
 * CLI에서는 실제 파일 시스템을 사용하여 적용
 */
export function analyzeSnippetConflicts(
  snippets: CodeSnippet[],
  existingPaths: Set<string>
): { safe: CodeSnippet[]; conflicts: CodeSnippet[] } {
  const safe: CodeSnippet[] = [];
  const conflicts: CodeSnippet[] = [];

  for (const snippet of snippets) {
    if (snippet.strategy === 'create' && existingPaths.has(snippet.path)) {
      conflicts.push(snippet);
    } else {
      safe.push(snippet);
    }
  }

  return { safe, conflicts };
}

/**
 * .env.example 내용 생성
 */
export function generateEnvExample(
  envVars: PackageEnvVar[],
  serviceName?: string
): string {
  const lines: string[] = [];

  if (serviceName) {
    lines.push(`# --- ${serviceName} ---`);
  }

  for (const ev of envVars) {
    if (ev.description) {
      lines.push(`# ${ev.description}`);
    }
    const value = ev.default_value || '';
    lines.push(`${ev.key}=${value}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * 전체 패키지의 .env.example 생성
 */
export function generateFullEnvExample(
  services: { slug: string; env_vars: PackageEnvVar[] }[]
): string {
  const sections = services
    .filter((s) => s.env_vars.length > 0)
    .map((s) => generateEnvExample(s.env_vars, s.slug));

  return sections.join('\n');
}

/**
 * CLI용: 스니펫 콘텐츠를 파일 경로 기반으로 정리
 * (실제 파일 I/O는 CLI에서 수행)
 */
export function prepareSnippetsForApply(
  snippets: CodeSnippet[]
): Map<string, { content: string; strategy: CodeSnippet['strategy']; description: string }> {
  const result = new Map<
    string,
    { content: string; strategy: CodeSnippet['strategy']; description: string }
  >();

  for (const snippet of snippets) {
    result.set(snippet.path, {
      content: snippet.content,
      strategy: snippet.strategy,
      description: snippet.description,
    });
  }

  return result;
}
