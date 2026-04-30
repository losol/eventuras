import { Meta } from '@storybook/react-vite';
import React, { useState } from 'react';

import { Drawer } from './Drawer';

const getRandomHipsterIpsum = () => {
  const hipsterIpsums = [
    'Pabst semiotics distillery bicycle rights forage. Art party crucifix poutine vinyl.',
    'Vexillologist ramps chambray meditation. Ethical air plant keytar brooklyn.',
    'Chia mumblecore hoodie umami fanny pack quinoa sriracha. Gastropub truffaut etsy succulents.',
    'Bespoke kinfolk food truck yuccie seitan. Tofu taxidermy quinoa microdosing prism.',
  ];
  const randomIndex = Math.floor(Math.random() * hipsterIpsums.length);
  return hipsterIpsums[randomIndex];
};

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  parameters: {
    tags: ['autodocs'],
  },
};

export default meta;

const OpenDrawerComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <p>{getRandomHipsterIpsum()}</p>
      <Drawer isOpen={isOpen} onCancel={() => setIsOpen(false)}>
        <Drawer.Header>
          <Drawer.Heading>Drawer Header</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer.Body>
        <Drawer.Footer>Drawer Footer</Drawer.Footer>
      </Drawer>
    </div>
  );
};

export const OpenDrawer = () => <OpenDrawerComponent />;

const ClosedDrawerComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p>This is some content before the drawer.</p>
      <button onClick={() => setIsOpen(true)}>Open Drawer</button>
      <Drawer isOpen={isOpen} onCancel={() => setIsOpen(false)}>
        <Drawer.Header>
          <Drawer.Heading>Drawer Header sample</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer.Body>
        <Drawer.Footer>Drawer Footer</Drawer.Footer>
      </Drawer>
    </div>
  );
};

export const ClosedDrawer = () => <ClosedDrawerComponent />;

const DrawerWithActionsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleCancel = () => {
    alert('Cancel action triggered!');
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Drawer</button>
      <Drawer isOpen={isOpen} onCancel={handleCancel}>
        <Drawer.Header>
          <Drawer.Heading>Drawer With Cancel</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export const DrawerWithCancel = () => <DrawerWithActionsComponent />;
