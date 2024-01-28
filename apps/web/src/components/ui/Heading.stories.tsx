import { Meta } from '@storybook/react';
import React from 'react';

import Heading, { HeadingProps } from './Heading';

const meta: Meta<typeof Heading> = {
  component: Heading,
  tags: ['autodocs'],
};

export default meta;

// Define a function that returns a JSX element of the Heading component
const renderHeading = (args: HeadingProps) => <Heading {...args} />;

export const Level1 = () =>
  renderHeading({
    as: 'h1',
    children: 'Heading Level 1',
  });

export const Level2 = () =>
  renderHeading({
    as: 'h2',
    children: 'Heading Level 2',
  });

export const Level3 = () =>
  renderHeading({
    as: 'h3',
    children: 'Heading Level 3',
  });

export const Level4 = () =>
  renderHeading({
    as: 'h4',
    children: 'Heading Level 4',
  });

export const Level5 = () =>
  renderHeading({
    as: 'h5',
    children: 'Heading Level 5',
  });

export const Level6 = () =>
  renderHeading({
    as: 'h6',
    children: 'Heading Level 6',
  });
