import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { create, insert } from '@orama/orama';
import { persist } from '@orama/plugin-data-persistence';

import { DOCS_SCHEMA } from './schema.js';

interface BuildSearchIndexOptions {
  /** Directory containing built HTML files */
  siteDir: string;
  /** Output path for the JSON index file */
  outputPath: string;
  /** Optional callback for logging progress */
  log?: (message: string) => void;
}

/**
 * Build an Orama search index from HTML files in a directory.
 *
 * Reads all .html files, extracts title and text content,
 * and serializes the index to a JSON file.
 */
export async function buildSearchIndex({ siteDir, outputPath, log }: BuildSearchIndexOptions): Promise<number> {
  const db = create({ schema: DOCS_SCHEMA });

  const htmlFiles = findHtmlFiles(siteDir);
  let indexed = 0;

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf-8');
    const title = extractTitle(html);
    const content = stripHtml(html);
    const url = htmlPathToUrl(file, siteDir);

    if (!content.trim()) continue;

    insert(db, { title, content, url });
    indexed++;
  }

  const snapshot = await persist(db, 'json');
  const dir = dirname(outputPath);
  const { mkdirSync } = await import('node:fs');
  mkdirSync(dir, { recursive: true });
  writeFileSync(outputPath, JSON.stringify(snapshot));

  log?.(`Indexed ${indexed} pages → ${relative(process.cwd(), outputPath)}`);

  return indexed;
}

/** Recursively find all .html files in a directory */
function findHtmlFiles(dir: string): string[] {
  const results: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      results.push(full);
    }
  }

  return results;
}

/** Extract the <title> or first <h1> from HTML */
function extractTitle(html: string): string {
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (titleMatch?.[1]) return titleMatch[1].trim();

  const h1Match = /<h1[^>]*>([^<]+)<\/h1>/i.exec(html);
  if (h1Match?.[1]) return h1Match[1].trim();

  return '';
}

/** Strip HTML tags and collapse whitespace to get searchable text */
function stripHtml(html: string): string {
  return html
    .replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replaceAll(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replaceAll(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replaceAll(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/&[a-z]+;/gi, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/** Convert an HTML file path to a URL path: /site/foo/bar/index.html → /foo/bar */
function htmlPathToUrl(file: string, siteDir: string): string {
  let url = '/' + relative(siteDir, file).replaceAll('\\', '/');
  url = url.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return url || '/';
}
