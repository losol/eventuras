import type { List, ListItem, Paragraph, PhrasingContent, Root } from 'mdast';
import { visit } from 'unist-util-visit';

export interface ParsedScheduleItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

/**
 * Regex matching a time range like "09:00–10:30" or a single time like "19:00".
 * Supports : and . as separator, – and - as range delimiter.
 */
const TIME_RE = /^(\d{1,2}[.:]\d{2})\s*([–-]\s*\d{1,2}[.:]\d{2})?$/;

/** Extract plain text from mdast phrasing content nodes. */
function textContent(nodes: PhrasingContent[]): string {
  return nodes
    .map(n => {
      if (n.type === 'text') return n.value;
      if ('children' in n) return textContent(n.children as PhrasingContent[]);
      return '';
    })
    .join('');
}

/**
 * Try to parse a single mdast ListItem as a schedule item.
 *
 * Expected AST structure (from `- **09:00–10:00** Title | Speaker | Desc`):
 * ```
 * listItem → paragraph → [strong([text("09:00–10:00")]), text(" Title | Speaker | Desc")]
 * ```
 */
function parseListItem(item: ListItem): ParsedScheduleItem | null {
  // ListItem must contain exactly one paragraph
  if (item.children.length !== 1) return null;
  const firstChild = item.children[0];
  if (firstChild?.type !== 'paragraph') return null;

  const para = firstChild as Paragraph;
  if (para.children.length === 0) return null;

  // First inline child must be <strong> containing a time pattern
  const first = para.children[0];
  if (first?.type !== 'strong') return null;

  const timeText = textContent(first.children).trim();
  if (!TIME_RE.test(timeText)) return null;

  const time = timeText.replaceAll('.', ':');

  // Remaining inline children form the pipe-separated text
  const restText = textContent(para.children.slice(1)).trim();
  const parts = restText.split('|').map(s => s.trim());

  const title = parts[0];
  if (!title) return null;

  return {
    time,
    title,
    speaker: parts[1] || undefined,
    description: parts[2] || undefined,
  };
}

/**
 * Remark plugin that detects schedule-patterned unordered lists in the
 * markdown AST and transforms them into custom `schedule-list` / `schedule-item`
 * hast elements.
 *
 * A list is treated as a schedule when ALL items match the pattern:
 *   `- **HH:MM–HH:MM** Title | Speaker | Description`
 *
 * Transformed nodes use `data.hName` and `data.hProperties` so that
 * remark-rehype produces custom HTML elements that react-markdown can map
 * to Schedule components via the `components` prop.
 */
export function remarkSchedule() {
  return (tree: Root) => {
    visit(tree, 'list', (node: List) => {
      if (node.ordered) return;

      const parsed: ParsedScheduleItem[] = [];
      for (const child of node.children) {
        const item = parseListItem(child);
        if (!item) return; // Any non-matching item → leave list unchanged
        parsed.push(item);
      }

      if (parsed.length === 0) return;

      // Mark the list node as a schedule-list for remark-rehype
      node.data = {
        ...node.data,
        hName: 'schedule-list',
      };

      // Mark each list item as a schedule-item with parsed data as properties
      node.children.forEach((child, i) => {
        const item = parsed[i]!;
        child.data = {
          ...child.data,
          hName: 'schedule-item',
          hProperties: {
            'data-time': item.time,
            'data-title': item.title,
            'data-speaker': item.speaker ?? '',
            'data-description': item.description ?? '',
          },
        };
      });
    });
  };
}
