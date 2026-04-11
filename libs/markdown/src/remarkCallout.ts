import type { Blockquote, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

export const CALLOUT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

/**
 * GitHub-flavored callout syntax:
 *
 * ```markdown
 * > [!NOTE]
 * > Content here
 * ```
 */
const CALLOUT_REGEX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/;

/**
 * Remark plugin that detects GitHub-style callouts in blockquotes and
 * transforms them into custom `callout` hast elements.
 *
 * A blockquote is treated as a callout when its first paragraph's text
 * matches `[!TYPE]` where TYPE is NOTE, TIP, IMPORTANT, WARNING, or CAUTION.
 */
export function remarkCallout() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      if (node.children.length === 0) return;

      const para = node.children[0];
      if (para?.type !== 'paragraph') return;
      if (para.children.length === 0) return;

      const firstInline = para.children[0];
      if (firstInline?.type !== 'text') return;

      const text = (firstInline as Text).value;
      const firstLine = text.split('\n')[0]?.trim();
      if (!firstLine) return;

      const match = firstLine.match(CALLOUT_REGEX);
      if (!match) return;

      const calloutType = match[1] as CalloutType;

      // Remove the [!TYPE] line from the first paragraph's text
      const restOfFirstText = text.split('\n').slice(1).join('\n').trim();
      if (restOfFirstText) {
        (firstInline as Text).value = restOfFirstText;
      } else {
        para.children.shift();
        if (para.children.length === 0) {
          node.children.shift();
        }
      }

      node.data = {
        ...node.data,
        hName: 'callout',
        hProperties: {
          'data-callout-type': calloutType,
        },
      };
    });
  };
}
