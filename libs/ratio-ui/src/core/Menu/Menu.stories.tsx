import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react-vite';
import Menu, { MenuProps } from './Menu';
import { Avatar } from '../Avatar';
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
 * A custom trigger pill with the new `Avatar` component — the canonical
 * user-menu trigger look.
 */
export const CustomTrigger: MenuStory = () => (
  <Menu>
    <Menu.Trigger className="inline-flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-border-2 bg-card text-(--text) hover:border-(--primary) transition-colors">
      <Avatar name="Leo Losen" size="sm" />
      <span className="text-sm">leo@losen.com</span>
      <Menu.Chevron className="ml-0 h-3.5 w-3.5 text-(--text-muted)" />
    </Menu.Trigger>
    <Menu.Link href="/user">My profile</Menu.Link>
    <Menu.Link href="/user/account">Account</Menu.Link>
    <Menu.Button id="custom-logout" onClick={() => console.log('Logout')}>
      Log out
    </Menu.Button>
  </Menu>
);

/**
 * The full user-menu shape with `Menu.Header` at the top — avatar +
 * name + email + role chip on a primary-tinted surface, followed by
 * the regular menu items.
 *
 * `Menu.Header` and its `.Name` / `.Email` / `.Role` slots are marked
 * `@beta` — the API may evolve before release without major bumps.
 */
export const UserMenuWithHeader: MenuStory = () => (
  <div className="flex justify-end">
    <Menu>
      <Menu.Trigger className="inline-flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-border-2 bg-card text-(--text) hover:border-(--accent) focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--accent)/45 aria-expanded:shadow-[0_2px_10px_color-mix(in_oklch,var(--accent)_28%,transparent)] transition-all">
        <Avatar name="Leo Losen" size="sm" />
        <span className="text-sm">leo@losen.com</span>
        <Menu.Chevron className="ml-0 h-3.5 w-3.5 text-(--text-muted)" />
      </Menu.Trigger>
      <Menu.Header>
        <Avatar name="Leo Losen" size="lg" />
        <Menu.Header.Name>Leo Losen</Menu.Header.Name>
        <Menu.Header.Email>leo@losen.com</Menu.Header.Email>
        <Menu.Header.Role>Admin</Menu.Header.Role>
      </Menu.Header>
      <Menu.Link href="/user">My profile</Menu.Link>
      <Menu.Link href="/user/account">Account</Menu.Link>
      <Menu.Button id="user-logout" onClick={() => console.log('Logout')}>
        Log out
      </Menu.Button>
    </Menu>
  </div>
);
