import fs from 'node:fs';
import path from 'node:path';

import type { TreeViewNode } from '@eventuras/ratio-ui/core/TreeView';
import type { TocHeading } from '@eventuras/ratio-ui/core/TableOfContents';

const CONTENT_DIR = path.join(process.cwd(), 'content');

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
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: { title: '' }, content: raw };
  }

  const yaml = match[1] ?? '';
  const content = match[2] ?? '';

  const title = yaml.match(/^title:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, '') ?? '';
  const description = yaml.match(/^description:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, '');
  const source = yaml.match(/^source:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, '');

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
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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
  if (parts[parts.length - 1] === 'index') {
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

  // Group files by their directory structure
  const nodeMap = new Map<string, TreeViewNode>();

  for (const file of files) {
    const slug = filePathToSlug(file);
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { frontmatter } = parseFrontmatter(raw);
    const href = slug.length === 0 ? '/' : `/${slug.join('/')}`;
    const title = frontmatter.title || slug[slug.length - 1] || 'Home';

    if (slug.length === 0) {
      // Root index
      tree.push({ title, href });
      continue;
    }

    // For each directory level, ensure a parent node exists
    for (let i = 0; i < slug.length; i++) {
      const key = slug.slice(0, i + 1).join('/');
      if (!nodeMap.has(key)) {
        const isLeaf = i === slug.length - 1;
        const node: TreeViewNode = {
          title: isLeaf ? title : formatDirName(slug[i] ?? ''),
          href: isLeaf ? href : undefined,
          children: isLeaf ? undefined : [],
        };
        nodeMap.set(key, node);

        // Attach to parent or root
        if (i === 0) {
          tree.push(node);
        } else {
          const parentKey = slug.slice(0, i).join('/');
          const parent = nodeMap.get(parentKey);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      } else if (i === slug.length - 1) {
        // This is a leaf file for an existing directory node
        const existing = nodeMap.get(key)!;
        existing.href = href;
        existing.title = title;
      }
    }
  }

  // Sort children alphabetically
  function sortTree(nodes: TreeViewNode[]) {
    nodes.sort((a, b) => a.title.localeCompare(b.title));
    for (const node of nodes) {
      if (node.children) sortTree(node.children);
    }
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
