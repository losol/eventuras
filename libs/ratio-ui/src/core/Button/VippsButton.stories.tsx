import { Meta, StoryFn } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import VippsButton, { VippsButtonProps } from './VippsButton';

const meta: Meta<typeof VippsButton> = {
  component: VippsButton,
  tags: ['autodocs'],
  args: {
    locale: 'no',
    disabled: false,
    loading: false,
    block: false,
    onClick: fn(),
  },
  argTypes: {
    locale: {
      control: { type: 'select' },
      options: ['no', 'nb', 'nn', 'en', 'da', 'sv', 'fi'],
      description: 'Locale for button text',
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
    children: { control: 'text', description: 'Custom button text (overrides locale default)' },
  },
};

export default meta;

type VippsButtonStory = StoryFn<VippsButtonProps>;

const Template: VippsButtonStory = (args) => <VippsButton {...args} />;

export const Playground = Template.bind({});
Playground.storyName = 'Playground';

export const Norwegian = Template.bind({});
Norwegian.args = {
  locale: 'no',
};

export const English = Template.bind({});
English.args = {
  locale: 'en',
};

export const CustomText = Template.bind({});
CustomText.args = {
  children: 'Betal med Vipps',
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  block: true,
};

export const AllStates = () => {
  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h4 className="mb-2 font-semibold">Default (Norwegian)</h4>
        <VippsButton locale="no" />
      </div>

      <div>
        <h4 className="mb-2 font-semibold">English</h4>
        <VippsButton locale="en" />
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Loading</h4>
        <VippsButton loading />
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Disabled</h4>
        <VippsButton disabled />
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Custom Text</h4>
        <VippsButton>Vipps Ekspress</VippsButton>
      </div>

      <div>
        <h4 className="mb-2 font-semibold">Full Width</h4>
        <VippsButton block />
      </div>
    </div>
  );
};
AllStates.storyName = 'All States';

// Tests
let clickSpy: ReturnType<typeof fn>;

export const VippsButtonTest = {
  render: () => {
    clickSpy = fn();
    return (
      <div className="space-y-4">
        <VippsButton onClick={clickSpy} testId="vipps-enabled">
          Enabled Button
        </VippsButton>
        <VippsButton disabled testId="vipps-disabled">
          Disabled Button
        </VippsButton>
        <VippsButton loading testId="vipps-loading">
          Loading Button
        </VippsButton>
      </div>
    );
  },

  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Test enabled button click
    const enabledBtn = canvas.getByTestId('vipps-enabled');
    await userEvent.click(enabledBtn);
    await expect(clickSpy).toHaveBeenCalledTimes(1);

    // Test disabled button doesn't trigger click
    const disabledBtn = canvas.getByTestId('vipps-disabled');
    await expect(disabledBtn).toBeDisabled();

    // Test loading button doesn't trigger click
    const loadingBtn = canvas.getByTestId('vipps-loading');
    await expect(loadingBtn).toBeDisabled();
  },
};
