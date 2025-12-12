import { Meta, StoryFn } from '@storybook/react-vite';
import Menu, { MenuProps } from './Menu';
import { fn } from 'storybook/test';

const meta: Meta<typeof Menu> = {
  component: Menu,
  tags: ['autodocs'],
  args: {
    menuLabel: 'Menu',
  },
};

export default meta;

type MenuStory = StoryFn<MenuProps>;

export const Playground: MenuStory = args => (
  <Menu {...args}>
    <Menu.Link href="#item1">Menu Item 1</Menu.Link>
    <Menu.Link href="#item2">Menu Item 2</Menu.Link>
    <Menu.Link href="#item3">Menu Item 3</Menu.Link>
  </Menu>
);

export const WithLinks: MenuStory = () => (
  <Menu menuLabel="Navigation">
    <Menu.Link href="/home">Home</Menu.Link>
    <Menu.Link href="/about">About</Menu.Link>
    <Menu.Link href="/services">Services</Menu.Link>
    <Menu.Link href="/contact">Contact</Menu.Link>
  </Menu>
);

export const WithButtons: MenuStory = () => (
  <Menu menuLabel="Actions">
    <Menu.Button id="action1" onClick={fn()}>
      Action 1
    </Menu.Button>
    <Menu.Button id="action2" onClick={fn()}>
      Action 2
    </Menu.Button>
    <Menu.Button id="action3" onClick={fn()}>
      Action 3
    </Menu.Button>
  </Menu>
);

export const Mixed: MenuStory = () => (
  <Menu menuLabel="Options">
    <Menu.Link href="/profile">View Profile</Menu.Link>
    <Menu.Link href="/settings">Settings</Menu.Link>
    <Menu.Button id="logout" onClick={() => console.log('Logout clicked')}>
      Logout
    </Menu.Button>
  </Menu>
);

export const UserMenu: MenuStory = () => (
  <Menu menuLabel="User Menu">
    <Menu.Link href="/dashboard">Dashboard</Menu.Link>
    <Menu.Link href="/profile">My Profile</Menu.Link>
    <Menu.Link href="/notifications">Notifications</Menu.Link>
    <Menu.Link href="/settings">Account Settings</Menu.Link>
    <Menu.Button id="signout" onClick={() => console.log('Sign out')}>
      Sign Out
    </Menu.Button>
  </Menu>
);

export const AdminMenu: MenuStory = () => (
  <Menu menuLabel="Admin">
    <Menu.Link href="/admin">Admin Dashboard</Menu.Link>
    <Menu.Link href="/admin/users">Manage Users</Menu.Link>
    <Menu.Link href="/admin/events">Manage Events</Menu.Link>
    <Menu.Link href="/admin/reports">View Reports</Menu.Link>
    <Menu.Link href="/admin/settings">System Settings</Menu.Link>
  </Menu>
);
