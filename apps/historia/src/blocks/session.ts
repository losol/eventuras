import type { Block } from 'payload';

import { description } from '@/fields/description';
import { title } from '@/fields/title';

export const Session: Block = {
  interfaceName: 'SessionBlock',
  fields: [
    title,
    description,
    {
      name: 'startTime',
      label: 'Session Start time',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 5,
        },
      },
    },
    {
      name: 'endTime',
      label: 'Session End time',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 5,
        },
      },
    },
    {
      name: 'schedule',
      type: 'array',
      label: 'Schedule',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Segment title',
          localized: true,
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Segment Duration (minutes)',
          admin: {
            step: 5,
          },
        },
        {
          name: 'contributors',
          type: 'array',
          label: 'Contributors',
          fields: [
            {
              name: 'person',
              type: 'relationship',
              relationTo: 'persons',
            },
            {
              name: 'text',
              type: 'text',
              label: 'Speaker text',
              localized: true,
            }
          ],
        },
      ],
    },
  ],
  slug: 'session',
};
