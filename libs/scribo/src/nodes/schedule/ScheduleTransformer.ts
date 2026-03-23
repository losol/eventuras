import { ElementTransformer } from '@lexical/markdown';

import {
  $createScheduleItemNode,
  $isScheduleItemNode,
  ScheduleItemNode,
} from './ScheduleItemNode';

/**
 * Markdown format: `- **09:00–10:00** Title | Speaker | Description`
 *
 * This matches the format expected by the remarkSchedule plugin in
 * markdown-plugin-happening, so the same markdown renders correctly
 * both in the editor and on the frontend.
 */
const SCHEDULE_ITEM_REGEX = /^-\s+\*\*(\d{1,2}[.:]\d{2}(?:\s*[–-]\s*\d{1,2}[.:]\d{2})?)\*\*\s+(.+)$/;

export const SCHEDULE_ITEM_TRANSFORMER: ElementTransformer = {
  type: 'element',
  dependencies: [ScheduleItemNode],

  regExp: SCHEDULE_ITEM_REGEX,

  export: (node) => {
    if (!$isScheduleItemNode(node)) return null;

    const { time, title, speaker, description } = node.getData();
    const parts = [title, speaker, description].filter(Boolean);
    return `- **${time}** ${parts.join(' | ')}`;
  },

  replace: (parentNode, _children, match) => {
    const time = match[1]!.replaceAll('.', ':');
    const rest = match[2]!;
    const parts = rest.split('|').map((s) => s.trim());

    const node = $createScheduleItemNode({
      time,
      title: parts[0] ?? '',
      speaker: parts[1] || undefined,
      description: parts[2] || undefined,
    });

    parentNode.replace(node);
  },
};
