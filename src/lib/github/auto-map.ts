/**
 * Auto-mapping: Linkmap environment variables → GitHub Secrets names
 * Handles naming conventions and conflict detection.
 */

export interface MappedSecret {
  envVarId: string;
  envVarKey: string;
  secretName: string;
  conflict: boolean;
  conflictReason?: string;
}

/**
 * Map Linkmap env var names to valid GitHub Secrets names.
 * GitHub Secrets names can only contain alphanumeric characters and underscores,
 * must not start with GITHUB_ prefix (reserved), and must not start with a number.
 */
export function mapEnvVarToSecretName(keyName: string): string {
  // GitHub env var names are already in UPPER_SNAKE_CASE, so mostly compatible
  let name = keyName
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/^_+/, '')
    .replace(/_+/g, '_');

  // Cannot start with a number
  if (/^[0-9]/.test(name)) {
    name = `_${name}`;
  }

  // Cannot start with GITHUB_ (reserved by GitHub)
  if (name.startsWith('GITHUB_')) {
    name = `LM_${name}`;
  }

  return name || 'UNNAMED_SECRET';
}

/**
 * Map a list of env vars to GitHub Secrets, detecting conflicts.
 */
export function autoMapEnvVars(
  envVars: Array<{ id: string; key_name: string }>
): MappedSecret[] {
  const seen = new Map<string, string>(); // secretName → envVarKey
  const results: MappedSecret[] = [];

  for (const ev of envVars) {
    const secretName = mapEnvVarToSecretName(ev.key_name);
    const existing = seen.get(secretName);

    if (existing) {
      results.push({
        envVarId: ev.id,
        envVarKey: ev.key_name,
        secretName,
        conflict: true,
        conflictReason: `'${ev.key_name}'과 '${existing}'가 동일한 시크릿 이름 '${secretName}'으로 매핑됩니다`,
      });
    } else {
      seen.set(secretName, ev.key_name);
      results.push({
        envVarId: ev.id,
        envVarKey: ev.key_name,
        secretName,
        conflict: false,
      });
    }
  }

  return results;
}
