import { Meta, StoryFn } from '@storybook/react-vite';
import { Home } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

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


// Tests
// Module‑scoped spies so play() can see them
let enabledSpy: ReturnType<typeof fn>;
let disabledSpy: ReturnType<typeof fn>;
let loadingSpy: ReturnType<typeof fn>;

export const ButtonTest = {
  // Custom render that sets up three buttons
  render: () => {
    enabledSpy  = fn();
    disabledSpy = fn();
    loadingSpy  = fn();

    return (
      <div className="flex flex-col gap-2">
        <Button variant="primary" onClick={enabledSpy}>
          Default
        </Button>
        <Button variant="primary" disabled onClick={disabledSpy}>
          Disabled
        </Button>
        <Button variant="primary" loading onClick={loadingSpy}>
          Loading
        </Button>
      </div>
    );
  },
  // @ts-ignore
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const btnDefault  = canvas.getByRole('button', { name: 'Default' });
    const btnDisabled = canvas.getByRole('button', { name: 'Disabled' });
    const btnLoading  = canvas.getByRole('button', { name: 'Loading' });

    // 1) Default button calls its spy
    await userEvent.click(btnDefault);
    await expect(enabledSpy).toHaveBeenCalled();

    // 2) Disabled button does *not* call its spy
    await userEvent.click(btnDisabled);
    await expect(disabledSpy).not.toHaveBeenCalled();

    // 3) Loading button does *not* call its spy
    await userEvent.click(btnLoading);
    await expect(loadingSpy).not.toHaveBeenCalled();
  },
};
