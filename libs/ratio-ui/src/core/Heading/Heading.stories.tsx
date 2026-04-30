import { Meta } from '@storybook/react-vite';
import React from 'react';

import { Heading, type HeadingProps } from './Heading';

const meta: Meta<typeof Heading> = {
  component: Heading,
  tags: ['autodocs'],
};

export default meta;

const renderHeading = (args: HeadingProps) => <Heading {...args} />;

export const Level1 = () =>
  renderHeading({
    as: 'h1',
    children: 'Heading Level 1',
  });

export const Level2 = () =>
  renderHeading({
    as: 'h2',
    children: 'Heading Level 2',
  });

export const Level3 = () =>
  renderHeading({
    as: 'h3',
    children: 'Heading Level 3',
  });

export const Level4 = () =>
  renderHeading({
    as: 'h4',
    children: 'Heading Level 4',
  });

export const Level5 = () =>
  renderHeading({
    as: 'h5',
    children: 'Heading Level 5',
  });

export const Level6 = () =>
  renderHeading({
    as: 'h6',
    children: 'Heading Level 6',
  });

/**
 * `Heading.Group` renders an `<hgroup>` — semantic HTML for a heading
 * paired with a kicker/eyebrow. Screen readers announce the pair as a
 * single heading unit.
 */
export const WithGroup = () => (
  <Heading.Group>
    <Heading.Eyebrow>The library</Heading.Eyebrow>
    <Heading as="h2">What's inside</Heading>
  </Heading.Group>
);

/**
 * `Heading.Eyebrow` defaults to `tone="primary"` (Linseed) — quieter,
 * intended for sections subordinate to the page hero. Use `tone="accent"`
 * (Ochre) for the page's top-of-page heading.
 */
export const EyebrowTones = () => (
  <div className="space-y-6">
    <Heading.Group>
      <Heading.Eyebrow>Primary tone (default)</Heading.Eyebrow>
      <Heading as="h3">Quieter, for body sections</Heading>
    </Heading.Group>
    <Heading.Group>
      <Heading.Eyebrow tone="accent">Accent tone</Heading.Eyebrow>
      <Heading as="h3">Louder, for the page hero</Heading>
    </Heading.Group>
  </div>
);
