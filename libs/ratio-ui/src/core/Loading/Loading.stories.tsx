import { Meta, StoryFn } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Loading } from './Loading';

const meta: Meta<typeof Loading> = {
  component: Loading,
  tags: ['autodocs'],
};

export default meta;

type LinkStory = StoryFn;

const Template: LinkStory = (args) => <Loading {...args} />;

export const Playground = Template.bind({});
Playground.storyName = 'Playground';

export const Default = Template.bind({});
