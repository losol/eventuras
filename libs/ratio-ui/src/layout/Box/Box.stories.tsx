import { Meta } from '@storybook/react';
import React from 'react';

import { Box } from './Box';

const meta: Meta<typeof Box> = {
  component: Box,
  title: 'Layout/Box',
  tags: ['autodocs'],
};

export default meta;

export const Default = () => <Box>Default Box</Box>;

export const WithPadding = () => <Box padding="20px">Box with Padding</Box>;

export const WithMargin = () => <Box margin="20px">Box with Margin</Box>;

export const CustomElement = () => (
  <Box as="section">
    Box as a <section></section>
  </Box>
);

export const Combined = () => (
  <>
    <Box>Default Box</Box>
    <Box padding="20px">Box with Padding</Box>
    <Box margin="20px">Box with Margin</Box>
    <Box as="section">
      Box as a <section></section>
    </Box>
  </>
);
