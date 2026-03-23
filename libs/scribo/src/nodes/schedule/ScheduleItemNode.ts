import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { createElement } from 'react';

import { ScheduleItemComponent } from './ScheduleItemComponent';

export interface ScheduleItemData {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export type SerializedScheduleItemNode = Spread<
  { data: ScheduleItemData },
  SerializedLexicalNode
>;

export class ScheduleItemNode extends DecoratorNode<JSX.Element> {
  __data: ScheduleItemData;

  static getType(): string {
    return 'schedule-item';
  }

  static clone(node: ScheduleItemNode): ScheduleItemNode {
    return new ScheduleItemNode({ ...node.__data }, node.__key);
  }

  constructor(data: ScheduleItemData, key?: NodeKey) {
    super(key);
    this.__data = data;
  }

  getData(): ScheduleItemData {
    return this.getLatest().__data;
  }

  setData(data: ScheduleItemData): void {
    const self = this.getWritable();
    self.__data = data;
  }

  // --- DOM ---

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'schedule-item';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('div');
    el.className = 'schedule-item';
    el.dataset.time = this.__data.time;
    el.dataset.title = this.__data.title;
    if (this.__data.speaker) el.dataset.speaker = this.__data.speaker;
    if (this.__data.description) el.dataset.description = this.__data.description;
    return { element: el };
  }

  // --- Serialization ---

  static importJSON(json: SerializedScheduleItemNode): ScheduleItemNode {
    return $createScheduleItemNode(json.data);
  }

  exportJSON(): SerializedScheduleItemNode {
    return {
      ...super.exportJSON(),
      type: 'schedule-item',
      data: this.__data,
    };
  }

  // --- Text ---

  getTextContent(): string {
    const { time, title, speaker, description } = this.__data;
    const parts = [title, speaker, description].filter(Boolean);
    return `${time} ${parts.join(' | ')}`;
  }

  isInline(): boolean {
    return false;
  }

  // --- Decorator (React rendering is handled by the component) ---

  decorate(): JSX.Element {
    return createElement(ScheduleItemComponent, {
      nodeKey: this.__key,
      data: this.__data,
    });
  }
}

export function $createScheduleItemNode(data: ScheduleItemData): ScheduleItemNode {
  return $applyNodeReplacement(new ScheduleItemNode(data));
}

export function $isScheduleItemNode(node: LexicalNode | null | undefined): node is ScheduleItemNode {
  return node instanceof ScheduleItemNode;
}
