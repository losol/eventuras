import { ReactNode, createContext, useContext, useRef, useCallback } from 'react';
import {
  Button as AriaButton,
  Menu as AriaMenu,
  MenuItem,
  MenuItemProps,
  MenuTrigger,
  Popover,
} from 'react-aria-components';
import { ChevronDown, Sun, Moon } from '../../icons';

const styles = {
  popover:
    'w-56 origin-top-right shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden',
  menuItemsList: 'bg-white dark:bg-slate-900 focus:outline-hidden',
  menuItem:
    'cursor-pointer group flex w-full items-center px-2 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-gray-100',
};

type RegisterAction = (id: string, fn: () => void) => void;
const MenuActionsContext = createContext<RegisterAction>(() => {});

export type MenuLinkProps = {
  href: string;
  children: ReactNode;
  testId?: string;
};

const MenuLink = (props: MenuLinkProps & MenuItemProps) => (
  <MenuItem {...props} data-testid={props.testId} className={styles.menuItem}>
    {props.children}
  </MenuItem>
);

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

export type MenuThemeToggleProps = {
  theme?: 'light' | 'dark' | null;
  onThemeChange: (theme: 'light' | 'dark') => void;
  lightLabel?: string;
  darkLabel?: string;
};

const Menu = (props: MenuProps) => {
  const actionsRef = useRef(new Map<string, () => void>());

  const registerAction: RegisterAction = useCallback((id, fn) => {
    actionsRef.current.set(id, fn);
  }, []);

  return (
    <MenuTrigger>
      <AriaButton
        data-testid="logged-in-menu-button"
        className="inline-flex items-center gap-2 border font-bold bg-primary-700 dark:bg-primary-950 hover:bg-primary-700 text-white rounded-full px-4 py-1 m-1 transition-all duration-500 transform ease-in-out active:scale-110 hover:shadow-sm"
      >
        {props.menuLabel}
        <ChevronDown className="ml-1 h-5 w-5" />
      </AriaButton>
      <Popover className={styles.popover}>
        <MenuActionsContext.Provider value={registerAction}>
          <AriaMenu
            className={styles.menuItemsList}
            onAction={key => {
              const fn = actionsRef.current.get(key.toString());
              if (fn) fn();
            }}
          >
            {props.children}
          </AriaMenu>
        </MenuActionsContext.Provider>
      </Popover>
    </MenuTrigger>
  );
};

const MenuButton = (props: MenuButtonProps & MenuItemProps) => {
  const register = useContext(MenuActionsContext);
  register(props.id, props.onClick);

  return (
    <MenuItem {...props} className={styles.menuItem} data-testid={props.testId}>
      {props.children}
    </MenuItem>
  );
};

const MenuThemeToggle = ({
  theme,
  onThemeChange,
  lightLabel = 'Light theme',
  darkLabel = 'Dark theme',
}: MenuThemeToggleProps) => {
  const isDark = theme === 'dark';
  const register = useContext(MenuActionsContext);
  register('theme-toggle', () => onThemeChange(isDark ? 'light' : 'dark'));

  return (
    <MenuItem id="theme-toggle" className={styles.menuItem}>
      <span className="flex items-center gap-2">
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        {isDark ? lightLabel : darkLabel}
      </span>
    </MenuItem>
  );
};

export default Object.assign(Menu, {
  Link: MenuLink,
  Button: MenuButton,
  ThemeToggle: MenuThemeToggle,
});
