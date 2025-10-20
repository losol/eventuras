import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Stepper } from './Stepper';

const meta = {
  title: 'Core/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A step indicator component for multi-step workflows. Supports horizontal and vertical orientations, different variants (numbered, dots, line), and status indicators (complete, current, upcoming, error).',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['numbered', 'dots', 'line'],
      description: 'Visual style of the stepper',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction',
    },
    currentStep: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Currently active step number',
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicSteps = [
  { number: 1, label: 'Account', status: 'complete' as const },
  { number: 2, label: 'Products', status: 'current' as const },
  { number: 3, label: 'Payment', status: 'upcoming' as const },
  { number: 4, label: 'Confirm', status: 'upcoming' as const },
];

const stepsWithDescriptions = [
  {
    number: 1,
    label: 'Account Details',
    description: 'Verify your information',
    status: 'complete' as const
  },
  {
    number: 2,
    label: 'Select Products',
    description: 'Choose items to purchase',
    status: 'current' as const
  },
  {
    number: 3,
    label: 'Payment Info',
    description: 'Enter billing details',
    status: 'upcoming' as const
  },
  {
    number: 4,
    label: 'Confirmation',
    description: 'Review and submit',
    status: 'upcoming' as const
  },
];

const stepsWithError = [
  { number: 1, label: 'Account', status: 'complete' as const },
  { number: 2, label: 'Products', status: 'error' as const },
  { number: 3, label: 'Payment', status: 'upcoming' as const },
  { number: 4, label: 'Confirm', status: 'upcoming' as const },
];

/** Basic horizontal stepper with numbered variant */
export const HorizontalNumbered: Story = {
  args: {
    steps: basicSteps,
    currentStep: 2,
    variant: 'numbered',
    orientation: 'horizontal',
  },
};

/** Horizontal stepper with descriptions */
export const WithDescriptions: Story = {
  args: {
    steps: stepsWithDescriptions,
    currentStep: 2,
    variant: 'numbered',
    orientation: 'horizontal',
  },
};

/** Dots variant for minimal display */
export const DotsVariant: Story = {
  args: {
    steps: basicSteps,
    currentStep: 2,
    variant: 'dots',
    orientation: 'horizontal',
  },
};

/** Vertical orientation */
export const VerticalNumbered: Story = {
  args: {
    steps: stepsWithDescriptions,
    currentStep: 2,
    variant: 'numbered',
    orientation: 'vertical',
  },
};

/** Vertical with dots */
export const VerticalDots: Story = {
  args: {
    steps: basicSteps,
    currentStep: 3,
    variant: 'dots',
    orientation: 'vertical',
  },
};

/** Error state example */
export const WithError: Story = {
  args: {
    steps: stepsWithError,
    currentStep: 2,
    variant: 'numbered',
    orientation: 'horizontal',
  },
};

/** All steps completed */
export const AllCompleted: Story = {
  args: {
    steps: [
      { number: 1, label: 'Account', status: 'complete' as const },
      { number: 2, label: 'Products', status: 'complete' as const },
      { number: 3, label: 'Payment', status: 'complete' as const },
      { number: 4, label: 'Confirm', status: 'complete' as const },
    ],
    currentStep: 5,
    variant: 'numbered',
    orientation: 'horizontal',
  },
};

/** Interactive example showing different states */
export const Interactive: Story = {
  args: {
    steps: [
      { number: 1, label: 'Start', status: 'upcoming' as const },
      { number: 2, label: 'Middle', status: 'upcoming' as const },
      { number: 3, label: 'End', status: 'upcoming' as const },
    ],
    currentStep: 1,
    variant: 'numbered',
    orientation: 'horizontal',
  },
  render: (args) => {
    const [currentStep, setCurrentStep] = React.useState(args.currentStep);

    return (
      <div className="space-y-6">
        <Stepper
          {...args}
          currentStep={currentStep}
        />

        <div className="flex gap-2 justify-center">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={currentStep === 3}
          >
            Next
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Current Step: {currentStep}
        </div>
      </div>
    );
  },
};

/** Registration flow example (real-world use case) */
export const RegistrationFlow: Story = {
  args: {
    steps: [
      {
        number: 1,
        label: 'Account',
        description: 'Verify your details',
        status: 'complete' as const
      },
      {
        number: 2,
        label: 'Products',
        description: 'Select course materials',
        status: 'complete' as const
      },
      {
        number: 3,
        label: 'Payment',
        description: 'Enter billing information',
        status: 'current' as const
      },
      {
        number: 4,
        label: 'Confirm',
        description: 'Review and register',
        status: 'upcoming' as const
      },
    ],
    currentStep: 3,
    variant: 'numbered',
    orientation: 'horizontal',
  },
};
