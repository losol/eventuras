import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react-vite';
import Menu, { MenuProps } from './Menu';
import { fn } from 'storybook/test';

const meta: Meta<typeof Menu> = {
  component: Menu,
  tags: ['autodocs'],
};

export default meta;

type MenuStory = StoryFn<MenuProps>;

export const Playground: MenuStory = () => (
  <Menu>
    <Menu.Trigger>
      Menu
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="#item1">Menu Item 1</Menu.Link>
    <Menu.Link href="#item2">Menu Item 2</Menu.Link>
    <Menu.Link href="#item3">Menu Item 3</Menu.Link>
  </Menu>
);

export const WithLinks: MenuStory = () => (
  <Menu>
    <Menu.Trigger>
      Navigation
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="/home">Home</Menu.Link>
    <Menu.Link href="/about">About</Menu.Link>
    <Menu.Link href="/services">Services</Menu.Link>
    <Menu.Link href="/contact">Contact</Menu.Link>
  </Menu>
);

export const WithButtons: MenuStory = () => (
  <Menu>
    <Menu.Trigger>
      Actions
      <Menu.Chevron />
    </Menu.Trigger>
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
  <Menu>
    <Menu.Trigger>
      Options
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="/profile">View Profile</Menu.Link>
    <Menu.Link href="/settings">Settings</Menu.Link>
    <Menu.Button id="logout" onClick={() => console.log('Logout clicked')}>
      Logout
    </Menu.Button>
  </Menu>
);

export const UserMenu: MenuStory = () => (
  <Menu>
    <Menu.Trigger>
      User Menu
      <Menu.Chevron />
    </Menu.Trigger>
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
  <Menu>
    <Menu.Trigger>
      Admin
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="/admin">Admin Dashboard</Menu.Link>
    <Menu.Link href="/admin/users">Manage Users</Menu.Link>
    <Menu.Link href="/admin/events">Manage Events</Menu.Link>
    <Menu.Link href="/admin/reports">View Reports</Menu.Link>
    <Menu.Link href="/admin/settings">System Settings</Menu.Link>
  </Menu>
);

export const WithThemeToggle: MenuStory = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <Menu>
      <Menu.Trigger>
        user@example.com
        <Menu.Chevron />
      </Menu.Trigger>
      <Menu.Link href="/profile">My Profile</Menu.Link>
      <Menu.Link href="/account">Account</Menu.Link>
      <Menu.ThemeToggle theme={theme} onThemeChange={setTheme} />
      <Menu.Button id="logout" onClick={() => console.log('Logout')}>
        Log out
      </Menu.Button>
    </Menu>
  );
};

/**
 * A custom trigger — pass any content + className to override the default
 * pill. Useful for avatar-style triggers or icon-only buttons.
 */
export const CustomTrigger: MenuStory = () => (
  <Menu>
    <Menu.Trigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-2 bg-card text-(--text) hover:border-(--primary) transition-colors">
      <span
        aria-hidden="true"
        className="w-7 h-7 rounded-full bg-(--primary)/20 text-(--primary) font-serif italic text-sm flex items-center justify-center"
      >
        ol
      </span>
      <span className="text-sm">losvik@gmail.com</span>
      <Menu.Chevron className="ml-0 h-3.5 w-3.5 text-(--text-muted)" />
    </Menu.Trigger>
    <Menu.Link href="/user">My profile</Menu.Link>
    <Menu.Link href="/user/account">Account</Menu.Link>
    <Menu.Button id="custom-logout" onClick={() => console.log('Logout')}>
      Log out
    </Menu.Button>
  </Menu>
);
