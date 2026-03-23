import type { Transformer } from '@lexical/markdown';
import type { Klass, LexicalNode } from 'lexical';

export interface ScriboToolbarButton {
  /** Unique key */
  key: string;
  /** Tooltip / aria-label */
  label: string;
  /** CSS class for the icon */
  iconClass?: string;
  /** Called when the button is clicked */
  onSelect: (editor: import('lexical').LexicalEditor) => void;
}

export interface ScriboPlugin {
  /** Unique name for the plugin */
  name: string;
  /** Lexical nodes to register */
  nodes?: Klass<LexicalNode>[];
  /** Markdown transformers (placed before built-in transformers) */
  transformers?: Transformer[];
  /** Buttons to add to the toolbar */
  toolbarButtons?: ScriboToolbarButton[];
}
