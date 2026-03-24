import {
  type MultilineElementTransformer,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { $createParagraphNode } from 'lexical';

import {
  $createCalloutNode,
  $isCalloutNode,
  CalloutNode,
  CALLOUT_TYPES,
  type CalloutType,
} from './CalloutNode';

/**
 * GitHub-flavored callout syntax:
 *
 * ```markdown
 * > [!NOTE]
 * > Content line 1 with **bold** and [links](url)
 * > Content line 2
 * ```
 *
 * Supports: NOTE, TIP, IMPORTANT, WARNING, CAUTION
 */
const CALLOUT_START_REGEX = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/;
const BLOCKQUOTE_LINE_REGEX = /^>\s?(.*)$/;

export const CALLOUT_TRANSFORMER: MultilineElementTransformer = {
  type: 'multiline-element',
  dependencies: [CalloutNode],

  regExpStart: CALLOUT_START_REGEX,

  regExpEnd: {
    regExp: /^(?!>\s?)/, // Ends when a line doesn't start with >
    optional: true,
  },

  export: (node, exportChildren) => {
    if (!$isCalloutNode(node)) return null;

    const calloutType = node.getCalloutType();
    const childContent = exportChildren(node);
    const lines = childContent.split('\n');
    const quoted = lines.map((line) => `> ${line}`).join('\n');
    return `> [!${calloutType}]\n${quoted}`;
  },

  replace: (rootNode, _children, startMatch, _endMatch, linesInBetween) => {
    const calloutType = startMatch[1] as CalloutType;
    if (!CALLOUT_TYPES.includes(calloutType)) return false;

    // Strip blockquote prefixes to get plain markdown content
    const contentLines = (linesInBetween ?? [])
      .map((line) => {
        const match = line.match(BLOCKQUOTE_LINE_REGEX);
        return match ? match[1] ?? '' : null;
      })
      .filter((line): line is string => line !== null);

    const innerMarkdown = contentLines.join('\n').trim();

    const calloutNode = $createCalloutNode(calloutType);

    if (innerMarkdown) {
      // Parse inner markdown directly into calloutNode to avoid corrupting
      // the outer root state with a global root.clear()
      $convertFromMarkdownString(innerMarkdown, TRANSFORMERS, calloutNode);
    }

    // Ensure at least one empty paragraph for editing
    if (calloutNode.getChildrenSize() === 0) {
      calloutNode.append($createParagraphNode());
    }

    rootNode.replace(calloutNode);
    return true;
  },
};
