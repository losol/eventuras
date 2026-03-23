import { $getSelection, $isRangeSelection } from 'lexical';
import { $findMatchingParent } from '@lexical/utils';

import type { ScriboPlugin } from '../../types';
import { $createScheduleItemNode, ScheduleItemNode } from './ScheduleItemNode';
import { SCHEDULE_ITEM_TRANSFORMER } from './ScheduleTransformer';

export const schedulePlugin: ScriboPlugin = {
  name: 'schedule',
  nodes: [ScheduleItemNode],
  transformers: [SCHEDULE_ITEM_TRANSFORMER],
  toolbarButtons: [
    {
      key: 'schedule-item',
      label: 'Schedule Item',
      iconClass: 'schedule',
      onSelect: (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchor = selection.anchor.getNode();
          const topLevel =
            $findMatchingParent(anchor, (n) => n.getParent()?.getType() === 'root') ??
            anchor;

          const node = $createScheduleItemNode({ time: '', title: '' });
          topLevel.insertAfter(node);
          node.selectEnd();
        });
      },
    },
  ],
};
