import { Meta, StoryFn } from '@storybook/react';
import { Home } from 'lucide-react';
import { expect, fn, userEvent, within } from '@storybook/test';

import Button, { ButtonProps } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    disabled: false,
    loading: false,
    block: false,
    onDark: false,
    icon: false,
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'light', 'text'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
    onDark: { control: 'boolean' },
    icon: {
      control: 'boolean',
      description: 'Toggle to show a Home icon before the label',
    },
    children: { control: 'text' },
  },
};

export default meta;

type ButtonStory = StoryFn<ButtonProps & { icon: boolean }>;

const Template: ButtonStory = ({ icon, ...args }) => (
  <Button {...args} icon={icon ? <Home strokeWidth={1} /> : undefined} />
);

export const Playground = Template.bind({});
Playground.storyName = 'Playground';

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Secondary',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  children: 'Outline',
};

export const Light = Template.bind({});
Light.args = {
  variant: 'light',
  children: 'Light',
};

export const TextButton = Template.bind({});
TextButton.args = {
  variant: 'text',
  children: 'Text',
};

export const AllCombinations = () => {
  const variants: ButtonProps['variant'][] = [
    'primary',
    'secondary',
    'outline',
    'light',
    'text',
  ];

  const states: { label: string; props: Partial<ButtonProps> }[] = [
    { label: 'Default', props: {} },
    { label: 'Disabled', props: { disabled: true } },
    { label: 'Loading', props: { loading: true } },
    { label: 'With Icon', props: { icon: <Home strokeWidth={1} /> } },
    {
      label: 'Icon + Loading',
      props: { icon: <Home strokeWidth={1} />, loading: true },
    },
    { label: 'On Dark', props: { onDark: true } },
  ];

  return (
    <div className="space-y-6">
      {variants.map((variant) => (
        <div key={variant}>
          <h4 className="mb-2 font-semibold">{variant}</h4>
          <div className="flex flex-wrap gap-2">
            {states.map(({ label, props }) => {
              const btn = (
                <Button
                  key={`${variant}-${label}`}
                  variant={variant}
                  {...props}
                >
                  {label}
                </Button>
              );

              // If this is the On Dark case, wrap in a black bg
              if (props.onDark) {
                return (
                  <div
                    key={`${variant}-${label}`}
                    className="bg-black p-2 rounded"
                  >
                    {btn}
                  </div>
                );
              }

              return btn;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
AllCombinations.storyName = 'All Variants & States';

export const ButtonTest = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
