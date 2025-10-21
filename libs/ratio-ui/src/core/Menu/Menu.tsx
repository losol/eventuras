import { ReactNode } from 'react';
import {
  Button as AriaButton,
  Menu as AriaMenu,
  MenuItem,
  MenuItemProps,
  MenuTrigger,
  Popover,
} from 'react-aria-components';

const styles = {
  menuWrapper: 'top-16 w-56 text-right',
  menu: 'relative inline-block text-left',
  menuTrigger: 'inline-flex justify-center w-full px-4 py-2 text-sm',
  menuItemsList:
    'w-56 origin-top-right divide-y divide-gray-400 bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden',
  menuItem:
    'cursor-pointer group flex w-full items-center px-2 py-3 hover:bg-primary-100 dark:hover:bg-primary-900 text-gray-900 dark:text-gray-100',
};

const ChevronIcon = () => (
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

export type MenuLinkProps = {
  href: string;
  children: ReactNode;
  testId?: string;
};

const MenuLink = (props: MenuLinkProps & MenuItemProps) => {
  return (
    <MenuItem {...props} data-testid={props.testId} className={styles.menuItem}>
      {props.children}
    </MenuItem>
  );
};

export type MenuProps = {
  menuLabel: string;
  children: ReactNode;
};

export type MenuButtonProps = {
  id: string;
  children: ReactNode;
  onClick: () => void;
  testId?: string;
};

/**
 * React-Aria menu does not provide support of interactive elements within the MenuItem, we therefore
 * create this functionMap which is then called by the Menu's onAction
 */
const functionMap: Map<string, () => void> = new Map();

const MenuButton = (props: MenuButtonProps & MenuItemProps) => {
  functionMap.set(props.id, props.onClick);
  return (
    <MenuItem {...props} className={styles.menuItem} data-testid={props.testId}>
      {props.children}
    </MenuItem>
  );
};

const Menu = (props: MenuProps) => {
  return (
    <MenuTrigger>
      <AriaButton
        data-testid="logged-in-menu-button"
        className="inline-flex items-center gap-2 border font-bold bg-primary-700 dark:bg-primary-950 hover:bg-primary-700 text-white rounded-full px-4 py-1 m-1 transition-all duration-500 transform ease-in-out active:scale-110 hover:shadow-sm"
      >
        {props.menuLabel}
        <ChevronIcon />
      </AriaButton>
      <Popover>
        <AriaMenu
          className={styles.menuItemsList}
          onAction={key => {
            const func = functionMap.get(key.toString());
            if (func) func();
          }}
        >
          {props.children}
        </AriaMenu>
      </Popover>
    </MenuTrigger>
  );
};
Menu.Link = MenuLink;
Menu.Button = MenuButton;
export default Menu;
