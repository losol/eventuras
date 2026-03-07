import { readFileSync } from 'fs';

function loadScopes(): string[] {
  try {
    const repo = JSON.parse(readFileSync('./repo.json', 'utf8'));
    const scopes = new Set<string>(repo.scopes ?? []);
    for (const section of ['apps', 'libs'] as const) {
      for (const [key, val] of Object.entries(repo[section] ?? {}) as [string, { aliases?: string[] }][]) {
        scopes.add(key);
        if (val.aliases) {
          for (const alias of val.aliases) {
            scopes.add(alias);
          }
        }
      }
    }
    return [...scopes].sort();
  } catch {
    return [];
  }
}

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', 1024],
    'scope-enum': [1, 'always', loadScopes()],
  },
};
