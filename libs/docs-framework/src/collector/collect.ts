import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

import fg from 'fast-glob';

import type { DocSource, DocsConfig } from './config.js';

interface CollectOptions {
  /** Absolute path to the repo/project root */
  rootDir: string;
  /** The docs configuration */
  config: DocsConfig;
  /** Absolute path to the directory containing docs.config.ts */
  configDir: string;
}

/**
 * Collect documentation from across the repo into a single output directory.
 *
 * Each source glob is resolved relative to rootDir. Files are copied to
 * config.output (relative to configDir) under the source's target path.
 *
 * README.md files are renamed to index.md to work as directory index pages.
 * Frontmatter (title, description) is auto-generated from package.json when configured.
 */
export async function collect({ rootDir, config, configDir }: CollectOptions): Promise<void> {
  const outputDir = resolve(configDir, config.output);

  // Clean output directory
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
    console.log(`Cleaned: ${outputDir}`);
  }
  mkdirSync(outputDir, { recursive: true });

  let totalFiles = 0;

  for (const source of config.sources) {
    const files = await fg(source.glob, {
      cwd: rootDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
      dot: false,
    });

    if (files.length === 0) {
      console.warn(`  ⚠ No files matched: ${source.glob}`);
      continue;
    }

    for (const file of files) {
      const sourcePath = resolve(rootDir, file);
      const targetPath = buildTargetPath(file, source, outputDir);

      const content = readFileSync(sourcePath, 'utf-8');
      const enriched = enrichContent(content, sourcePath, source, rootDir);

      const targetDir = dirname(targetPath);
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(targetPath, enriched);

      const relSource = relative(rootDir, sourcePath);
      const relTarget = relative(outputDir, targetPath);
      console.log(`  ${relSource} → ${relTarget}`);
      totalFiles++;
    }
  }

  console.log(`\nCollected ${totalFiles} files into ${relative(rootDir, outputDir)}`);
}

/**
 * Determine the output file path for a source file.
 * README.md becomes index.md so it acts as a directory index page.
 */
function buildTargetPath(file: string, source: DocSource, outputDir: string): string {
  const fileName = basename(file);
  const fileDir = dirname(file);

  // For glob patterns like "libs/*/README.md", use the parent directory name
  // as the file name: libs/event-sdk/README.md → /libraries/event-sdk.md
  if (fileName.toLowerCase() === 'readme.md') {
    const parentDir = basename(fileDir);
    const targetName = `${parentDir}.md`;
    return join(outputDir, source.target, targetName);
  }

  // For files inside a directory structure like "docs/developer/Config.md",
  // preserve the relative path under the target
  const globBase = getGlobBase(source.glob);
  const relativePath = relative(globBase, file);

  // If relative is empty (exact file match), use the filename directly
  if (!relativePath || relativePath === '.') {
    return join(outputDir, source.target, fileName);
  }
  return join(outputDir, source.target, relativePath);
}

/**
 * Get the static base directory from a glob pattern.
 * "docs/(star)(star)/(star).mdx" -> "docs"
 * "libs/(star)/README.md" -> "libs"
 */
function getGlobBase(glob: string): string {
  const parts = glob.split('/');
  const staticParts: string[] = [];
  for (const part of parts) {
    if (part.includes('*') || part.includes('{') || part.includes('?')) break;
    staticParts.push(part);
  }
  return staticParts.join('/') || '.';
}

/**
 * Enrich file content with frontmatter from package.json if configured,
 * or ensure existing frontmatter is preserved.
 */
function enrichContent(content: string, sourcePath: string, source: DocSource, rootDir: string): string {
  const { frontmatter: existingFrontmatter, body } = parseFrontmatter(content);

  const frontmatter: Record<string, unknown> = { ...existingFrontmatter };

  // Auto-generate title/description from package.json
  if (source.titleFromPackageJson || source.descriptionFromPackageJson) {
    const pkg = findNearestPackageJson(sourcePath);
    if (pkg) {
      if (source.titleFromPackageJson && !frontmatter.title) {
        // Strip @scope/ prefix: "@eventuras/event-sdk" → "event-sdk"
        const name = pkg.name?.replace(/^@[^/]+\//, '') ?? basename(dirname(sourcePath));
        frontmatter.title = name;
      }
      if (source.descriptionFromPackageJson && !frontmatter.description && pkg.description) {
        frontmatter.description = pkg.description;
      }
    }
  }

  // If no title, derive from first heading or filename
  if (!frontmatter.title) {
    const headingMatch = /^#\s+(.+)$/m.exec(body);
    if (headingMatch) {
      frontmatter.title = headingMatch[1].trim();
    }
  }

  // Add source reference (relative to repo root for portability)
  frontmatter.source = relative(rootDir, sourcePath);

  return formatFrontmatter(frontmatter) + body;
}

/**
 * Walk up from a file path to find the nearest package.json.
 */
function findNearestPackageJson(
  filePath: string,
): { name?: string; description?: string } | null {
  let dir = dirname(filePath);
  const root = resolve('/');

  while (dir !== root) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        return JSON.parse(readFileSync(pkgPath, 'utf-8'));
      } catch {
        return null;
      }
    }
    dir = dirname(dir);
  }
  return null;
}

/**
 * Parse YAML frontmatter from markdown content.
 * Replaces gray-matter to avoid the js-yaml vulnerability.
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(content);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value: string = trimmed.substring(colonIndex + 1).trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

/**
 * Format a frontmatter object as a YAML frontmatter block.
 */
function formatFrontmatter(data: Record<string, unknown>): string {
  if (Object.keys(data).length === 0) return '';

  const lines = Object.entries(data).map(([key, value]) => {
    const str = String(value);
    // Quote strings that contain special YAML characters
    if (typeof value === 'string' && /[:#{}[\],&*?|>!%@`]/.test(str)) {
      return `${key}: "${str.replaceAll('"', '\\"')}"`;
    }
    return `${key}: ${str}`;
  });

  return `---\n${lines.join('\n')}\n---\n\n`;
}
