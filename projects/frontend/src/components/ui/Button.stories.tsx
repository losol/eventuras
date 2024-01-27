import { Meta } from '@storybook/react';
import React from 'react';

import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Core/Button',
  tags: ['autodocs'],
};

export default meta;

export const Primary = () => <Button variant="primary">Tap Me If You Dare!</Button>;
export const Outline = () => <Button variant="secondary">Outline This!</Button>;
export const Light = () => <Button variant="light">Feather-Light Tap!</Button>;
export const Transparent = () => <Button variant="transparent">Shy, But Clickable!</Button>;
export const Disabled = () => (
  <Button variant="primary" disabled>
    Do not tap This!
  </Button>
);
export const Loading = () => (
  <Button variant="primary" loading>
    Loading...
  </Button>
);
export const BlockButton = () => (
  <Button variant="primary" block>
    I Take All The Space!
  </Button>
);
export const LightText = () => (
  <Button variant="secondary" bgDark>
    Light Text, Dark Mood!
  </Button>
);

export const Combined = () => (
  <>
    <Button variant="primary">Tap Me If You Dare!</Button>
    <Button variant="secondary">Outline This!</Button>
    <Button variant="primary" block>
      I Take All The Space!
    </Button>
    <Button variant="secondary" bgDark>
      Light Text, Dark Mood!
    </Button>
  </>
);
