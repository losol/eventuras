import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../core/Button';
import { ValueTile } from '../../core/ValueTile';
import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Blocks/Hero',
  component: Hero,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Hero>;

/**
 * Two-column editorial hero with eyebrow, italic-accented serif title,
 * lead paragraph, CTAs, and a stat panel on the right with a divider.
 */
export const WithStatPanel: Story = {
  render: () => (
    <Hero>
      <Hero.Main>
        <Hero.Eyebrow>A knowledge platform</Hero.Eyebrow>
        <Hero.Title>
          Build something{' '}
          <em className="font-serif text-(--primary)">considered</em>,{' '}
          <em className="font-serif text-(--accent)">curated</em>, and worth coming back to.
        </Hero.Title>
        <Hero.Lead>
          A place for long-form articles, study guides, and editorial collections — with the
          tooling to organize them, the typography to make them read, and the design system to
          keep it all consistent.
        </Hero.Lead>
        <Hero.Actions>
          <Button variant="primary" size="lg">Browse the library</Button>
          <Button variant="outline" size="lg">Read the manifesto</Button>
        </Hero.Actions>
      </Hero.Main>
      <Hero.Side>
        <ValueTile>
          <ValueTile.Value>
            <em className="text-(--accent)">240+</em> articles
          </ValueTile.Value>
          <ValueTile.Caption>Across reading, writing, research, and craft</ValueTile.Caption>
        </ValueTile>
        <ValueTile>
          <ValueTile.Value>
            12 <em className="text-(--accent)">collections</em>
          </ValueTile.Value>
          <ValueTile.Caption>Editorial reading lists curated by topic</ValueTile.Caption>
        </ValueTile>
        <ValueTile>
          <ValueTile.Value>
            1 <em className="text-(--accent)">subscription</em>
          </ValueTile.Value>
          <ValueTile.Caption>
            Open access, free for the curious, supported by patrons
          </ValueTile.Caption>
        </ValueTile>
      </Hero.Side>
    </Hero>
  ),
};

/**
 * Single-column hero — `Hero.Side` omitted. The grid collapses to one column
 * and the main content keeps a comfortable max-width via `Hero.Lead`.
 */
export const SingleColumn: Story = {
  render: () => (
    <Hero>
      <Hero.Main>
        <Hero.Eyebrow>The reading room</Hero.Eyebrow>
        <Hero.Title>
          Find knowledge —{' '}
          <em className="font-serif text-(--primary)">considered</em>,{' '}
          <em className="font-serif text-(--accent)">measured</em>, ours.
        </Hero.Title>
        <Hero.Lead>
          A design system built on clarity, proportion, and composable components. Use it to
          build editorial surfaces, knowledge bases, and reading-first interfaces that hold up
          under use.
        </Hero.Lead>
        <Hero.Actions>
          <Button variant="primary" size="lg">Start reading</Button>
          <Button variant="outline" size="lg">View the source</Button>
        </Hero.Actions>
      </Hero.Main>
    </Hero>
  ),
};

/**
 * Dark hero — `dark` prop applies `surface-dark`, so descendants reading
 * `var(--text)` switch to the light tone. Pair with a colored or
 * photographic background.
 */
export const DarkSurface: Story = {
  render: () => (
    <Hero dark className="bg-(--color-primary-900)">
      <Hero.Main>
        <Hero.Eyebrow>The winter issue</Hero.Eyebrow>
        <Hero.Title>
          Slow knowledge for{' '}
          <em className="font-serif text-(--accent)">long evenings</em>.
        </Hero.Title>
        <Hero.Lead>
          Twelve essays on memory, attention, and the practice of reading — selected for the
          months when the light fades early and there's time to sit with a thought.
        </Hero.Lead>
        <Hero.Actions>
          <Button variant="primary" size="lg">Open the issue</Button>
          <Button variant="outline" size="lg">Subscribe</Button>
        </Hero.Actions>
      </Hero.Main>
    </Hero>
  ),
};
