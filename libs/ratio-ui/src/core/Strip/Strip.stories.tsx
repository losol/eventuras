import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Strip } from './Strip';

const meta: Meta<typeof Strip> = {
  title: 'Core/Strip',
  component: Strip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Three-column horizontal card. Use `Strip.Lead` / `.Body` / `.Trail` slots for the canonical layout — date stamp on the left, content in the middle, meta + CTA on the right. Stacks to one column below the `md` breakpoint.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Strip>;

const MapPin = () => (
  <svg
    aria-hidden="true"
    className="size-4 shrink-0 text-(--text-subtle)"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Default: Story = {
  args: {
    hoverEffect: true,
    href: '#',
  },
  render: args => (
    <div className="max-w-4xl">
      <Strip {...args}>
        <Strip.Lead>
          <span>14.–16. SEP 2026</span>
        </Strip.Lead>
        <Strip.Body>
          <Badge variant="subtle" className="self-start">Course</Badge>
          <h3 className="font-serif text-xl leading-tight tracking-tight text-(--primary) m-0">
            Three-column horizontal card example
          </h3>
          <p className="text-sm text-(--text-muted) m-0 max-w-prose">
            Body slot takes flexible width. Use it for titles, headlines, and short
            descriptions. The leading and trailing slots stay fixed-width on wide
            screens.
          </p>
        </Strip.Body>
        <Strip.Trail>
          <span className="inline-flex items-center gap-2 text-sm">
            <MapPin />
            <span className="font-semibold text-(--text)">Conference center</span>
          </span>
          <span className="md:mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary)">
            View course <span aria-hidden="true">→</span>
          </span>
        </Strip.Trail>
      </Strip>
    </div>
  ),
};

export const StackedList: Story = {
  render: () => (
    <div className="max-w-4xl flex flex-col gap-3.5">
      {[
        { topLabel: '4.–5. MAY', y: '26', title: 'Health law course' },
        { topLabel: '6.–7. MAY', y: '2026', title: 'Surgery in general practice' },
        { topLabel: '14. SEP', y: '2026', title: 'Foundation course B (single day)' },
        { topLabel: '14.–16. SEP', y: '2026', title: 'Foundation course B (multi-day)' },
      ].map((c, i) => (
        <Strip key={i} hoverEffect href="#">
          <Strip.Lead>
            <span>{c.topLabel}</span>
            <span>'{c.y}</span>
          </Strip.Lead>
          <Strip.Body>
            <h3 className="font-serif text-xl leading-tight tracking-tight text-(--primary) m-0">
              {c.title}
            </h3>
          </Strip.Body>
          <Strip.Trail>
            <span className="inline-flex items-center gap-2 text-sm">
              <MapPin />
              <span className="font-semibold text-(--text)">Venue, City</span>
            </span>
            <span className="md:mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary)">
              View <span aria-hidden="true">→</span>
            </span>
          </Strip.Trail>
        </Strip>
      ))}
    </div>
  ),
};
