import './ScheduleItem.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getNodeByKey, $createParagraphNode, NodeKey } from 'lexical';
import { type DragEvent, useCallback, useEffect, useRef, useState } from 'react';

import {
  $createScheduleItemNode,
  $isScheduleItemNode,
  ScheduleItemData,
} from './ScheduleItemNode';

interface ScheduleItemComponentProps {
  nodeKey: NodeKey;
  data: ScheduleItemData;
}

export const ScheduleItemComponent = ({ nodeKey, data }: ScheduleItemComponentProps) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, _setSelected, _clearSelection] = useLexicalNodeSelection(nodeKey);
  const [localData, setLocalData] = useState(data);
  const [isDragging, setIsDragging] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const timeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Check if this is the last schedule item (show + button only on last)
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if (!node) return;
        const next = node.getNextSibling();
        setIsLast(!next || !$isScheduleItemNode(next));
      });
    });
  }, [editor, nodeKey]);

  const updateNode = useCallback(
    (updated: ScheduleItemData) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isScheduleItemNode(node)) {
          node.setData(updated);
        }
      });
    },
    [editor, nodeKey]
  );

  const handleChange = (field: keyof ScheduleItemData, value: string) => {
    const updated = { ...localData, [field]: value || undefined };
    if (field === 'time' || field === 'title') {
      updated[field] = value;
    }
    setLocalData(updated);
    updateNode(updated);
  };

  const insertAfter = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;
      const newNode = $createScheduleItemNode({ time: '', title: '' });
      node.insertAfter(newNode);
      newNode.selectEnd();
    });
  };

  const removeNode = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;
      const next = node.getNextSibling();
      const prev = node.getPreviousSibling();
      if (!next && !prev) {
        const p = $createParagraphNode();
        node.replace(p);
        p.selectEnd();
      } else {
        node.remove();
      }
    });
  };

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('text/plain', nodeKey);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData('text/plain');
    if (!sourceKey || sourceKey === nodeKey) return;
    editor.update(() => {
      const sourceNode = $getNodeByKey(sourceKey);
      const targetNode = $getNodeByKey(nodeKey);
      if (!sourceNode || !targetNode || !$isScheduleItemNode(sourceNode)) return;
      targetNode.insertBefore(sourceNode);
    });
  };

  return (
    <div className="schedule-item-wrapper">
      <div
        role="group"
        aria-label="Schedule item"
        className={`schedule-item-editor ${isSelected ? 'schedule-item-editor--selected' : ''} ${isDragging ? 'schedule-item-editor--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <button
          type="button"
          className="schedule-item-drag"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
        <input
          ref={timeRef}
          className="schedule-item-time"
          type="text"
          value={localData.time}
          onChange={(e) => handleChange('time', e.target.value)}
          placeholder="09:00–10:00"
          size={13}
        />
        <input
          className="schedule-item-title"
          type="text"
          value={localData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Title"
        />
        <input
          className="schedule-item-speaker"
          type="text"
          value={localData.speaker ?? ''}
          onChange={(e) => handleChange('speaker', e.target.value)}
          placeholder="Speaker"
        />
        <input
          className="schedule-item-description"
          type="text"
          value={localData.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description"
        />
        <button
          type="button"
          className="schedule-item-remove"
          onClick={removeNode}
          title="Remove item"
          aria-label="Remove schedule item"
        >
          ×
        </button>
      </div>
      {isLast && (
        <button
          type="button"
          className="schedule-item-add"
          onClick={insertAfter}
          title="Add item"
          aria-label="Add schedule item"
        >
          +
        </button>
      )}
    </div>
  );
};
