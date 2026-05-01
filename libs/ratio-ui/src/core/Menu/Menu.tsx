import { ReactNode, createContext, useContext, useEffect, useId, useRef } from 'react';
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
    'w-56 origin-top-right shadow-lg border border-border-1 rounded-xl overflow-hidden',
  menuItemsList: 'bg-card focus:outline-hidden',
  menuItem:
    'cursor-pointer group flex w-full items-center px-2 py-3 border-b border-border-1 last:border-b-0 hover:bg-card-hover text-(--text)',
};

type MenuActionsApi = {
  register: (id: string, fn: () => void) => void;
  unregister: (id: string) => void;
};
const MenuActionsContext = createContext<MenuActionsApi>({
  register: () => {},
  unregister: () => {},
});

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

  const api = useRef<MenuActionsApi>({
    register: (id, fn) => actionsRef.current.set(id, fn),
    unregister: (id) => actionsRef.current.delete(id),
  }).current;

  return (
    <MenuTrigger>
      <AriaButton
        data-testid="logged-in-menu-button"
        className="inline-flex items-center gap-2 border border-transparent font-bold bg-(--primary) hover:opacity-90 text-(--text-on-primary) rounded-full px-4 py-1 m-1 transition-all duration-500 transform ease-in-out active:scale-110 hover:shadow-sm"
      >
        {props.menuLabel}
        <ChevronDown aria-hidden="true" className="ml-1 h-5 w-5" />
      </AriaButton>
      <Popover className={styles.popover}>
        <MenuActionsContext.Provider value={api}>
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
  const { register, unregister } = useContext(MenuActionsContext);

  useEffect(() => {
    register(props.id, props.onClick);
    return () => unregister(props.id);
  }, [props.id, props.onClick, register, unregister]);

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
  const id = useId();
  const { register, unregister } = useContext(MenuActionsContext);

  const handlerRef = useRef(onThemeChange);
  handlerRef.current = onThemeChange;
  const themeRef = useRef(isDark);
  themeRef.current = isDark;

  useEffect(() => {
    register(id, () => handlerRef.current(themeRef.current ? 'light' : 'dark'));
    return () => unregister(id);
  }, [id, register, unregister]);

  return (
    <MenuItem id={id} className={styles.menuItem}>
      <span className="flex items-center gap-2">
        {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
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
