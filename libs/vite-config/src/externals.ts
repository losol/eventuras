import { readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { resolve } from 'node:path';

interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

/**
 * Reads the consumer package's package.json and returns RegExp patterns that
 * mark every runtime dependency (and its subpaths) as external.
 *
 * Bundling runtime deps into a library is harmful: it duplicates code, breaks
 * `instanceof` checks across module boundaries (the consumer's class identity
 * differs from the bundled copy), and inflates installed size. Consumers
 * already install these deps via the lib's own package.json.
 */
export function getRuntimeDependencyExternals(cwd: string = process.cwd()): RegExp[] {
  const pkgPath = resolve(cwd, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as PackageJson;

  const names = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ];

  return names.map(name => new RegExp(`^${escapeRegex(name)}(/.*)?$`));
}

/**
 * Externalize Node built-ins in both forms — `node:fs` (always matched by the
 * regex) and the bare `fs` form (matched against the explicit list, since the
 * names overlap with userland packages and can't be regex-distinguished).
 */
export const NODE_BUILTINS_EXTERNAL: (string | RegExp)[] = [
  /^node:/,
  ...builtinModules,
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
