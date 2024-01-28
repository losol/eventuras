import { Meta } from '@storybook/react';
import React from 'react';

import Portal from './Portal'; // Update the import path based on your project structure

const meta: Meta<typeof Portal> = {
  title: 'Components/Portal',
  component: Portal,
  parameters: {
    tags: ['autodocs'], // Assuming you want to use tags
    docs: {
      description: {
        component: 'A Portal component for rendering content outside the current DOM hierarchy.',
        target:
          'The ID of the target DOM element where the portal content will be rendered. If not provided, it defaults to "__next".',
      },
    },
  },
};

export default meta;

export const Default = () => (
  <Portal isOpen={true}>
    <div>This content is inside the portal.</div>
  </Portal>
);

export const ClosedPortal = () => (
  <Portal isOpen={false}>
    <div>This content will not be rendered.</div>
  </Portal>
);

export const CustomTarget = () => (
  <Portal isOpen={true} target="custom-root">
    <div>This content is rendered in a custom target element.</div>
  </Portal>
);
