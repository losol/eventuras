import {
  $applyNodeReplacement,
  $createParagraphNode,
  DOMConversionMap,
  DOMExportOutput,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

export const CALLOUT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

const CALLOUT_ICONS: Record<CalloutType, string> = {
  NOTE: 'ℹ️',
  TIP: '💡',
  IMPORTANT: '❗',
  WARNING: '⚠️',
  CAUTION: '🔴',
};

export type SerializedCalloutNode = Spread<
  { calloutType: CalloutType },
  SerializedElementNode
>;

export class CalloutNode extends ElementNode {
  __calloutType: CalloutType;

  static getType(): string {
    return 'callout';
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__calloutType, node.__key);
  }

  constructor(calloutType: CalloutType = 'NOTE', key?: NodeKey) {
    super(key);
    this.__calloutType = calloutType;
  }

  getCalloutType(): CalloutType {
    return this.getLatest().__calloutType;
  }

  setCalloutType(calloutType: CalloutType): void {
    const self = this.getWritable();
    self.__calloutType = calloutType;
  }

  // --- DOM ---

  createDOM(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.dataset.calloutKey = this.__key;
    this._applyDOMClass(wrapper);

    // Non-editable toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'callout-toolbar';
    toolbar.contentEditable = 'false';

    const icon = document.createElement('span');
    icon.className = 'callout-toolbar-icon';
    icon.textContent = CALLOUT_ICONS[this.__calloutType];
    toolbar.appendChild(icon);

    const select = document.createElement('select');
    select.className = 'callout-toolbar-type';
    select.setAttribute('aria-label', 'Callout type');
    for (const type of CALLOUT_TYPES) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0) + type.slice(1).toLowerCase();
      if (type === this.__calloutType) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener('change', () => {
      wrapper.dispatchEvent(new CustomEvent('callout-type-change', {
        bubbles: true,
        detail: { nodeKey: wrapper.dataset.calloutKey, calloutType: select.value },
      }));
    });
    toolbar.appendChild(select);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'callout-toolbar-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove callout';
    removeBtn.setAttribute('aria-label', 'Remove callout');
    removeBtn.addEventListener('click', () => {
      wrapper.dispatchEvent(new CustomEvent('callout-remove', {
        bubbles: true,
        detail: { nodeKey: wrapper.dataset.calloutKey },
      }));
    });
    toolbar.appendChild(removeBtn);

    wrapper.appendChild(toolbar);
    return wrapper;
  }

  private _applyDOMClass(dom: HTMLElement): void {
    dom.className = `callout-editor callout-editor--${this.__calloutType.toLowerCase()}`;
  }

  updateDOM(prevNode: CalloutNode, dom: HTMLElement): boolean {
    if (prevNode.__calloutType !== this.__calloutType) {
      this._applyDOMClass(dom);
      const icon = dom.querySelector('.callout-toolbar-icon');
      if (icon) icon.textContent = CALLOUT_ICONS[this.__calloutType];
      const select = dom.querySelector('.callout-toolbar-type') as HTMLSelectElement | null;
      if (select) select.value = this.__calloutType;
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('blockquote');
    el.dataset.calloutType = this.__calloutType;
    el.className = `callout callout--${this.__calloutType.toLowerCase()}`;
    return { element: el };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: (node: HTMLElement) => {
        const type = node.dataset.calloutType;
        if (!type || !CALLOUT_TYPES.includes(type as CalloutType)) return null;
        return {
          conversion: () => ({
            node: $createCalloutNode(type as CalloutType),
          }),
          priority: 1,
        };
      },
    };
  }

  // --- Serialization ---

  static importJSON(json: SerializedCalloutNode): CalloutNode {
    return $createCalloutNode(json.calloutType);
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      type: 'callout',
      calloutType: this.__calloutType,
    };
  }

  // --- Behavior ---

  canIndent(): boolean {
    return false;
  }

  collapseAtStart(): boolean {
    const children = this.getChildren();
    const parent = this.getParent();
    if (parent) {
      for (const child of children) {
        this.insertBefore(child);
      }
    }
    this.remove();
    return true;
  }

  insertNewAfter(): ElementNode {
    const lastChild = this.getLastChild();
    if (lastChild?.getTextContent() === '') {
      const p = $createParagraphNode();
      this.insertAfter(p);
      lastChild.remove();
      return p;
    }
    const p = $createParagraphNode();
    this.append(p);
    return p;
  }
}

export function $createCalloutNode(calloutType: CalloutType = 'NOTE'): CalloutNode {
  return $applyNodeReplacement(new CalloutNode(calloutType));
}

export function $isCalloutNode(node: LexicalNode | null | undefined): node is CalloutNode {
  return node instanceof CalloutNode;
}
