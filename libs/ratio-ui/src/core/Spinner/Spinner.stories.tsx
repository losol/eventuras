import { Meta, StoryFn } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  tags: ['autodocs'],
};

export default meta;

type LinkStory = StoryFn;

const Template: LinkStory = (args) => <Spinner {...args} />;

export const Playground = Template.bind({});
Playground.storyName = 'Playground';

export const Default = Template.bind({});
