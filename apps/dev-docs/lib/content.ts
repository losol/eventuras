import fs from 'node:fs';
import path from 'node:path';

import type { TocHeading } from '@eventuras/ratio-ui/core/TableOfContents';
import type { TreeViewNode } from '@eventuras/ratio-ui/core/TreeView';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

export interface DocPage {
  slug: string[];
  frontmatter: {
    title: string;
    description?: string;
    source?: string;
  };
  content: string;
  headings: TocHeading[];
}

/**
 * Parse YAML frontmatter from markdown content.
 * Returns the parsed fields and the remaining body.
 */
function parseFrontmatter(raw: string): { frontmatter: DocPage['frontmatter']; content: string } {
  const match = FRONTMATTER_REGEX.exec(raw);
  if (!match) {
    return { frontmatter: { title: '' }, content: raw };
  }

  const yaml = match[1] ?? '';
  const content = match[2] ?? '';

  const title = getFrontmatterValue(yaml, 'title') ?? '';
  const description = getFrontmatterValue(yaml, 'description');
  const source = getFrontmatterValue(yaml, 'source');

  // Strip leading h1 from content — it duplicates the frontmatter title
  const body = content.replace(/^\s*#\s+.+\r?\n+/, '');

  return { frontmatter: { title, description, source }, content: body };
}

/**
 * Slugify a heading text to generate an ID matching rehype-slug output.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

/**
 * Extract h2 and h3 headings from markdown content.
 */
function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = (match[1]?.length ?? 2) as 2 | 3;
    const text = match[2]?.trim() ?? '';
    headings.push({ id: slugify(text), text, level });
  }

  return headings;
}

/**
 * Recursively find all markdown files in a directory.
 */
function findMarkdownFiles(dir: string, base: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, base));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(path.relative(base, fullPath));
    }
  }

  return files;
}

/**
 * Convert a file path to a URL slug array.
 *
 * `developer/Email.md` → `['developer', 'email']`
 * `index.mdx` → `[]`
 */
function filePathToSlug(filePath: string): string[] {
  const withoutExt = filePath.replace(/\.(md|mdx)$/, '');
  const parts = withoutExt.split(path.sep);

  // index files represent the parent directory
  if (parts.at(-1) === 'index') {
    parts.pop();
  }

  return parts.map((p) => p.toLowerCase());
}

/**
 * Build a map from lowercase slug key to actual file path.
 * This ensures case-insensitive slug lookup works on case-sensitive
 * filesystems (Linux CI) where `Email.md` won't match `email.md`.
 */
function buildSlugToFileMap(): Map<string, string> {
  const files = findMarkdownFiles(CONTENT_DIR);
  const map = new Map<string, string>();

  for (const file of files) {
    const slug = filePathToSlug(file);
    const key = slug.join('/');
    map.set(key, file);
  }

  return map;
}

/**
 * Get all doc page slugs for generateStaticParams.
 */
export function getAllDocSlugs(): string[][] {
  const map = buildSlugToFileMap();
  return [...map.keys()]
    .filter((key) => key.length > 0)
    .map((key) => key.split('/'));
}

/**
 * Load a single doc page by slug.
 */
export function getDocBySlug(slug: string[]): DocPage | null {
  const key = slug.join('/');
  const map = buildSlugToFileMap();
  const file = map.get(key);

  if (!file) return null;

  const filePath = path.join(CONTENT_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, content } = parseFrontmatter(raw);
  const headings = extractHeadings(content);

  return { slug, frontmatter, content, headings };
}

/**
 * Build a hierarchical sidebar tree from the content directory.
 */
export function getSidebarTree(): TreeViewNode[] {
  const files = findMarkdownFiles(CONTENT_DIR);
  const tree: TreeViewNode[] = [];
  const nodeMap = new Map<string, TreeViewNode>();

  for (const file of files) {
    addFileToSidebarTree(file, tree, nodeMap);
  }

  sortTree(tree);

  return tree;
}

/**
 * Format a directory name for display: lowercase-hyphenated → Title Case.
 */
function formatDirName(name: string): string {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getFrontmatterValue(yaml: string, field: keyof DocPage['frontmatter']): string | undefined {
  const match = new RegExp(String.raw`^${field}:\s*(.+)$`, 'm').exec(yaml);
  const value = match?.[1]?.trim();

  if (!value) {
    return undefined;
  }

  return stripWrappingQuotes(value);
}

function stripWrappingQuotes(value: string): string {
  const isWrappedInDoubleQuotes = value.startsWith('"') && value.endsWith('"');
  const isWrappedInSingleQuotes = value.startsWith("'") && value.endsWith("'");

  if (isWrappedInDoubleQuotes || isWrappedInSingleQuotes) {
    return value.slice(1, -1);
  }

  return value;
}

function getSidebarNodeTitle(file: string, slug: string[]): string {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
  const { frontmatter } = parseFrontmatter(raw);

  return frontmatter.title || slug.at(-1) || 'Home';
}

function addFileToSidebarTree(
  file: string,
  tree: TreeViewNode[],
  nodeMap: Map<string, TreeViewNode>,
): void {
  const slug = filePathToSlug(file);
  const href = slug.length === 0 ? '/' : `/${slug.join('/')}`;
  const title = getSidebarNodeTitle(file, slug);

  if (slug.length === 0) {
    tree.push({ title, href });
    return;
  }

  for (let i = 0; i < slug.length; i++) {
    upsertSidebarNode(slug, i, title, href, tree, nodeMap);
  }
}

function upsertSidebarNode(
  slug: string[],
  index: number,
  title: string,
  href: string,
  tree: TreeViewNode[],
  nodeMap: Map<string, TreeViewNode>,
): void {
  const key = slug.slice(0, index + 1).join('/');
  const existing = nodeMap.get(key);

  if (existing) {
    if (index === slug.length - 1) {
      existing.href = href;
      existing.title = title;
    }
    return;
  }

  const isLeaf = index === slug.length - 1;
  const node: TreeViewNode = {
    title: isLeaf ? title : formatDirName(slug[index] ?? ''),
    href: isLeaf ? href : undefined,
    children: isLeaf ? undefined : [],
  };

  nodeMap.set(key, node);
  attachSidebarNode(slug, index, node, tree, nodeMap);
}

function attachSidebarNode(
  slug: string[],
  index: number,
  node: TreeViewNode,
  tree: TreeViewNode[],
  nodeMap: Map<string, TreeViewNode>,
): void {
  if (index === 0) {
    tree.push(node);
    return;
  }

  const parentKey = slug.slice(0, index).join('/');
  const parent = nodeMap.get(parentKey);
  parent?.children?.push(node);
}

function sortTree(nodes: TreeViewNode[]): void {
  nodes.sort((a, b) => a.title.localeCompare(b.title));
  for (const node of nodes) {
    if (node.children) {
      sortTree(node.children);
    }
  }
}
