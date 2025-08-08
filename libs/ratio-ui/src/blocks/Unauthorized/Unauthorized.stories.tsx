import type { Meta, StoryObj } from '@storybook/react';
import { Unauthorized } from './Unauthorized';

/** See: {@link Unauthorized} props (`homeUrl`, `variant`) */
const meta: Meta<typeof Unauthorized> = {
  // ➜ Folder in the sidebar
  title: 'Blocks/Unauthorized',
  // ➜ Component under test
  component: Unauthorized,
  // ➜ Tweak controls in the UI
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['small', 'large'],
    },
    homeUrl: { control: 'text' },
  },
  // ➜ Default args used by “Playground”
  args: {
    homeUrl: '/',
    variant: 'large',
  },
};
export default meta;

type Story = StoryObj<typeof Unauthorized>;

/** ➜ Interactive playground */
export const Playground: Story = {};

/** ➜ Compact section variant */
export const Small: Story = {
  args: { variant: 'small' },
};

/** ➜ Spacious section variant */
export const Large: Story = {
  args: { variant: 'large' },
};
