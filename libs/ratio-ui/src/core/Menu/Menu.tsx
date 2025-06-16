import { DATA_TEST_ID } from '@eventuras/utils';
import { ReactNode } from 'react';
import {
  Button,
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
  [DATA_TEST_ID]?: string;
};

const MenuLink = (props: MenuLinkProps & MenuItemProps) => {
  return (
    <MenuItem {...props} {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }} className={styles.menuItem}>
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
  [DATA_TEST_ID]?: string;
};

/**
 * React-Aria menu does not provide support of interactive elements within the MenuItem, we therefore
 * create this functionMap which is then called by the Menu's onAction
 */
const functionMap: Map<string, () => void> = new Map();

const MenuButton = (props: MenuButtonProps & MenuItemProps) => {
  functionMap.set(props.id, props.onClick);
  return (
    <MenuItem {...props} className={styles.menuItem} {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}>
      {props.children}
    </MenuItem>
  );
};

const Menu = (props: MenuProps) => {
  return (
    <MenuTrigger>
      <Button {...{ [DATA_TEST_ID]: 'logged-in-menu-button' }}>
        <div className={styles.menuTrigger}>
          {props.menuLabel}
          <ChevronIcon />
        </div>
      </Button>
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
