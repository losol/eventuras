import type { Block, Field } from 'payload';
import { richText } from '../fields/richText';

export const Session: Block = {
  interfaceName: 'SessionBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Session Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Session Description',
    },
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
          name: 'name',
          type: 'text',
          label: 'Segment name',
        },
        {
          name: 'startTime',
          label: 'Segment Start time',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
              displayFormat: 'h:mm',
              timeIntervals: 5,
            },
          },
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Session Duration (minutes)',
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
              name: 'role',
              type: 'text',
              label: 'Speaker Role',
            },
            {
              name: 'employer',
              type: 'text',
              label: 'Speaker Employer',
            },
          ],
        },
      ],
    },
  ],
  slug: 'session',
};
