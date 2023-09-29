import { Meta } from '@storybook/react';
import React from 'react';

import Button from './Button';

export default {
  component: Button,
  title: 'Core/Button',
  tags: ['autodocs'],
} as Meta;

export const Filled = () => <Button variant="primary">Tap Me If You Dare!</Button>;

export const Outline = () => <Button variant="secondary">Outline This!</Button>;

export const Light = () => <Button variant="light">Feather-Light Tap!</Button>;

export const Transparent = () => <Button variant="transparent">Shy, But Clickable!</Button>;

export const Combined = () => (
  <>
    <Button variant="primary">Tap Me If You Dare!</Button>
    <Button variant="secondary">Outline This!</Button>
  </>
);
