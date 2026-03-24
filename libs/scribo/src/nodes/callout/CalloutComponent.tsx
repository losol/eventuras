import './Callout.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $createParagraphNode } from 'lexical';
import { useEffect } from 'react';

import { $isCalloutNode, CALLOUT_TYPES, type CalloutType } from './CalloutNode';

/**
 * Plugin that listens for DOM custom events from CalloutNode toolbar
 * and updates the Lexical state accordingly.
 */
export const CalloutPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement()?.parentElement;
    if (!rootElement) return;

    const handleTypeChange = (e: Event) => {
      const { nodeKey, calloutType } = (e as CustomEvent).detail;
      if (!nodeKey || !CALLOUT_TYPES.includes(calloutType)) return;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isCalloutNode(node)) {
          node.setCalloutType(calloutType as CalloutType);
        }
      });
    };

    const handleRemove = (e: Event) => {
      const { nodeKey } = (e as CustomEvent).detail;
      if (!nodeKey) return;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isCalloutNode(node)) return;

        const children = node.getChildren();
        if (children.length > 0) {
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        } else {
          const p = $createParagraphNode();
          node.replace(p);
          p.selectEnd();
        }
      });
    };

    rootElement.addEventListener('callout-type-change', handleTypeChange);
    rootElement.addEventListener('callout-remove', handleRemove);

    return () => {
      rootElement.removeEventListener('callout-type-change', handleTypeChange);
      rootElement.removeEventListener('callout-remove', handleRemove);
    };
  }, [editor]);

  return null;
};
