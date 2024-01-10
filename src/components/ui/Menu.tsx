import {
  Menu as HeadlessMenu,
  MenuButtonProps as HeadlessMenuButtonProps,
} from '@headlessui/react';
import React, { FC, ReactNode } from 'react';

import Link from '@/components/ui/Link';
import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

const styles = {
  menuWrapper: 'top-16 w-56 text-right',
  menu: 'relative inline-block text-left',
  menuTrigger: 'inline-flex justify-center w-full px-4 py-2 text-sm',
  menuItemsList:
    'absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-400 bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 focus:outline-none',
  menuItem:
    'group flex w-full items-center px-2 py-3 hover:bg-primary-100 dark:hover:bg-primary-900 text-gray-900 dark:text-gray-100',
};

const ChevronIcon: FC = () => (
  <svg
    className="ml-2 h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

interface MenuTriggerProps extends HeadlessMenuButtonProps<'button'> {
  children: ReactNode;
  [TEST_ID_ATTRIBUTE]?: string;
}

const MenuTrigger: FC<MenuTriggerProps> = props => (
  <HeadlessMenu.Button className={styles.menuTrigger} data-test-id={props[TEST_ID_ATTRIBUTE]}>
    {props.children}
    <ChevronIcon />
  </HeadlessMenu.Button>
);

interface MenuItemsProps {
  children: ReactNode;
}

const MenuItems: FC<MenuItemsProps> = ({ children }) => (
  <HeadlessMenu.Items as="ul" className={styles.menuItemsList}>
    {children}
  </HeadlessMenu.Items>
);

interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
}

const MenuItem: FC<MenuItemProps> = ({ children, onClick }) => (
  <HeadlessMenu.Item as="li" className={styles.menuItem} onClick={onClick}>
    {children}
  </HeadlessMenu.Item>
);

interface MenuLinkProps {
  href: string;
  children: ReactNode;
  [TEST_ID_ATTRIBUTE]?: string;
}
const MenuLink: FC<MenuLinkProps> = props => (
  <HeadlessMenu.Item as="li">
    <Link href={props.href} className={styles.menuItem} data-test-id={props[TEST_ID_ATTRIBUTE]}>
      {props.children}
    </Link>
  </HeadlessMenu.Item>
);

interface MenuButtonProps {
  children: ReactNode;
  onClick: () => void;
  [TEST_ID_ATTRIBUTE]?: string;
}

const MenuButton: FC<MenuButtonProps> = props => (
  <HeadlessMenu.Item as="li">
    <button
      onClick={props.onClick}
      className={styles.menuItem}
      data-test-id={props[TEST_ID_ATTRIBUTE]}
    >
      {props.children}
    </button>
  </HeadlessMenu.Item>
);

const Menu: FC<{ children: ReactNode }> & {
  Trigger: FC<MenuTriggerProps>;
  Items: FC<MenuItemsProps>;
  Item: FC<MenuItemProps>;
  Link: FC<MenuLinkProps>;
  Button: FC<MenuButtonProps>;
} = ({ children }) => (
  <div className={styles.menuWrapper}>
    <HeadlessMenu as="nav" className={styles.menu}>
      {children}
    </HeadlessMenu>
  </div>
);

Menu.Trigger = MenuTrigger;
Menu.Items = MenuItems;
Menu.Item = MenuItem;
Menu.Link = MenuLink;
Menu.Button = MenuButton;

export default Menu;
