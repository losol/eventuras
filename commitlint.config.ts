import { readFileSync } from 'node:fs';

function loadScopes(): string[] {
  try {
    const repo = JSON.parse(readFileSync('./repo.json', 'utf8'));
    const scopes = new Set<string>(repo.scopes ?? []);
    for (const section of ['apps', 'libs'] as const) {
      for (const [key, val] of Object.entries(repo[section] ?? {}) as [string, { aliases?: string[]; }][]) {
        scopes.add(key);
        if (val.aliases) {
          for (const alias of val.aliases) {
            scopes.add(alias);
          }
        }
      }
    }
    return [...scopes].sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export default {
  extends: ['@commitlint/config-conventional'],
  // Dependabot capitalizes the "Bump" verb in grouped-update subjects, which
  // trips subject-case. That casing isn't configurable in dependabot.yml, so
  // skip linting its own commits (identified by the Signed-off-by trailer).
  ignores: [(message: string) => message.includes('Signed-off-by: dependabot[bot]')],
  rules: {
    'body-max-line-length': [1, 'always', 1024],
    'scope-enum': [1, 'always', loadScopes()],
  },
};
