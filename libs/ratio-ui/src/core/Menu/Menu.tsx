import {
  Children,
  isValidElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react';
import {
  Button as AriaButton,
  Menu as AriaMenu,
  MenuItem,
  MenuItemProps,
  MenuTrigger as AriaMenuTrigger,
  Popover,
} from 'react-aria-components';
import { ChevronDown, Sun, Moon } from '../../icons';
import { cn } from '../../utils/cn';

const styles = {
  popover: cn(
    'min-w-[280px] max-w-sm origin-top-right border border-border-1 rounded-xl overflow-hidden',
    // Light-mode glow: multi-layer primary-tinted box-shadow gives the
    // popover a soft editorial lift on the light surface.
    'shadow-[0_1px_0_color-mix(in_oklch,var(--primary)_6%,transparent),0_12px_28px_color-mix(in_oklch,var(--primary)_18%,transparent),0_4px_8px_color-mix(in_oklch,var(--primary)_12%,transparent)]',
    // Dark-mode shadow: primary-tinted shadows wash out on the dark
    // surface, so the design uses a thin white top-highlight + black
    // depth shadows for separation.
    'dark:shadow-[0_1px_0_rgb(255_255_255/0.08),0_16px_36px_rgb(0_0_0/0.6),0_4px_12px_rgb(0_0_0/0.4)]',
    // Pop-in / pop-out animation. React Aria Popover sets
    // `data-entering` / `data-exiting`; we transition opacity +
    // transform from a slightly-scaled, slightly-up state into the
    // resting position for a short editorial pop.
    'transition-[opacity,transform] duration-150 ease-out',
    'data-[entering]:opacity-0 data-[entering]:-translate-y-1 data-[entering]:scale-[0.98]',
    'data-[exiting]:opacity-0 data-[exiting]:-translate-y-1 data-[exiting]:scale-[0.98]',
  ),
  menuItemsList: 'bg-card focus:outline-hidden',
  menuItem:
    'cursor-pointer group flex w-full items-center px-2 py-3 border-b border-border-1 last:border-b-0 hover:bg-card-hover text-(--text)',
  triggerDefault:
    'inline-flex items-center gap-2 border border-transparent font-bold bg-(--primary) hover:opacity-90 text-(--text-on-primary) rounded-full px-4 py-1 m-1 transition-all duration-500 transform ease-in-out active:scale-110 hover:shadow-sm',
};

type MenuActionsApi = {
  register: (id: string, fn: () => void) => void;
  unregister: (id: string) => void;
};
const MenuActionsContext = createContext<MenuActionsApi>({
  register: () => {},
  unregister: () => {},
});

export type MenuTriggerProps = {
  children: ReactNode;
  /**
   * Override the default pill-shaped primary button styling. Pass any
   * Tailwind / utility classes to fully restyle the trigger (e.g. an
   * avatar pill or icon-only button). When omitted, the default
   * `--primary` rounded-full button is used.
   */
  className?: string;
  testId?: string;
};

const MenuTrigger = ({ children, className, testId }: MenuTriggerProps) => (
  <AriaButton
    data-testid={testId ?? 'logged-in-menu-button'}
    className={className ?? styles.triggerDefault}
  >
    {children}
  </AriaButton>
);
MenuTrigger.displayName = 'Menu.Trigger';

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

const Menu = ({ children }: MenuProps) => {
  const actionsRef = useRef(new Map<string, () => void>());
  const headerLabelId = useId();

  const api = useRef<MenuActionsApi>({
    register: (id, fn) => actionsRef.current.set(id, fn),
    unregister: (id) => actionsRef.current.delete(id),
  }).current;

  // Split children:
  //   - first <Menu.Trigger>      → React Aria's button (next to Popover)
  //   - first <Menu.Header>       → rendered inside Popover but OUTSIDE
  //                                 AriaMenu (it's not a navigable item;
  //                                 AriaMenu strips non-MenuItem children)
  //   - everything else           → menu items inside AriaMenu
  let trigger: ReactNode = null;
  let header: ReactNode = null;
  const items: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child)) {
      if (child.type === MenuTrigger) {
        if (trigger === null) trigger = child;
        continue;
      }
      if (child.type === MenuHeader) {
        if (header === null) header = child;
        continue;
      }
    }
    items.push(child);
  }
  if (trigger === null) {
    throw new Error(
      'Menu requires a <Menu.Trigger> child. Wrap the trigger label/content in <Menu.Trigger>...</Menu.Trigger>.',
    );
  }

  return (
    <AriaMenuTrigger>
      {trigger}
      <Popover placement="bottom end" className={styles.popover}>
        {header && <div id={headerLabelId}>{header}</div>}
        <MenuActionsContext.Provider value={api}>
          <AriaMenu
            className={styles.menuItemsList}
            // When a Menu.Header is present, point the menu's accessible
            // name at it so screen readers announce the user identity
            // when arrow-keying into the first item, instead of jumping
            // straight past the visually-rendered header.
            aria-labelledby={header ? headerLabelId : undefined}
            onAction={key => {
              const fn = actionsRef.current.get(key.toString());
              if (fn) fn();
            }}
          >
            {items}
          </AriaMenu>
        </MenuActionsContext.Provider>
      </Popover>
    </AriaMenuTrigger>
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

/**
 * Convenience: the chevron used by the default trigger pattern. Exported
 * so consumers can drop it into a custom `Menu.Trigger` without having to
 * reach into `../icons` themselves.
 */
const MenuChevron = ({ className }: { className?: string }) => (
  <ChevronDown
    aria-hidden="true"
    className={cn(
      'ml-1 h-5 w-5 transition-transform duration-200',
      // When the chevron sits inside a trigger with aria-expanded=true
      // (i.e. the menu is open), flip it 180° so the arrow points up.
      'in-aria-expanded:rotate-180',
      className,
    )}
  />
);
MenuChevron.displayName = 'Menu.Chevron';

// ── Menu.Header (beta) ────────────────────────────────────────────
//
// Identity block at the top of a user-menu dropdown. Composes the
// `Avatar` (or any leading node) with three meta slots — Name, Email,
// Role — into a flex row over a primary-tinted background.

interface MenuHeaderSlotProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Display name for the user-menu identity header. Serif, mid-weight,
 * `--text` color, ellipsised when it overflows the meta column.
 *
 * @beta API may evolve before release.
 */
const MenuHeaderName = ({ children, className }: MenuHeaderSlotProps) => (
  <h4
    className={cn(
      'font-serif font-medium text-base leading-tight tracking-tight',
      'text-(--text) m-0 truncate',
      className,
    )}
  >
    {children}
  </h4>
);
MenuHeaderName.displayName = 'Menu.Header.Name';

/**
 * Secondary line in the identity header — typically the user's email.
 * Sans, small, muted, ellipsised.
 *
 * @beta API may evolve before release.
 */
const MenuHeaderEmail = ({ children, className }: MenuHeaderSlotProps) => (
  <p
    className={cn(
      'text-sm text-(--text-muted) m-0 truncate mt-0.5',
      className,
    )}
  >
    {children}
  </p>
);
MenuHeaderEmail.displayName = 'Menu.Header.Email';

/**
 * Optional role / permission chip beneath the name + email — accent-
 * tinted pill in mono caps. Use for short labels like "Admin", "Owner",
 * or org-role descriptors.
 *
 * @beta API may evolve before release.
 */
const MenuHeaderRole = ({ children, className }: MenuHeaderSlotProps) => (
  <span
    className={cn(
      'self-start mt-2 inline-flex items-center px-2 py-0.5 rounded-full',
      'font-mono text-[10px] uppercase tracking-wider font-bold',
      'text-(--accent) bg-[color-mix(in_oklch,var(--accent)_18%,var(--surface))]',
      'border border-[color-mix(in_oklch,var(--accent)_35%,transparent)]',
      className,
    )}
  >
    {children}
  </span>
);
MenuHeaderRole.displayName = 'Menu.Header.Role';

const META_SLOTS = new Set<unknown>([MenuHeaderName, MenuHeaderEmail, MenuHeaderRole]);

/**
 * Identity block for the top of a user-menu dropdown. Composes a
 * leading node (typically `<Avatar>`) with the meta slots
 * `Menu.Header.Name`, `Menu.Header.Email`, and `Menu.Header.Role`.
 *
 * The component walks its children and groups the meta slots into a
 * flex column to the right of any non-meta children, so consumers
 * write the natural reading order without wrapping the meta column
 * themselves.
 *
 * @beta API may evolve before release.
 *
 * @example
 * ```tsx
 * <Menu.Header>
 *   <Avatar name="Leo Losen" size="lg" />
 *   <Menu.Header.Name>Leo Losen</Menu.Header.Name>
 *   <Menu.Header.Email>leo@losen.com</Menu.Header.Email>
 *   <Menu.Header.Role>Admin</Menu.Header.Role>
 * </Menu.Header>
 * ```
 */
const MenuHeader = ({ children, className }: MenuHeaderSlotProps) => {
  const childArray = Children.toArray(children);
  const meta: ReactNode[] = [];
  const lead: ReactNode[] = [];
  for (const child of childArray) {
    if (isValidElement(child) && META_SLOTS.has(child.type)) {
      meta.push(child);
    } else {
      lead.push(child);
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3.5 px-4 py-4',
        'bg-[color-mix(in_oklch,var(--primary)_8%,var(--surface))]',
        'dark:bg-[color-mix(in_oklch,var(--primary)_16%,var(--surface))]',
        'border-b border-border-1',
        className,
      )}
    >
      {lead}
      {meta.length > 0 && <div className="flex flex-col min-w-0 flex-1">{meta}</div>}
    </div>
  );
};
MenuHeader.displayName = 'Menu.Header';

export default Object.assign(Menu, {
  Trigger: MenuTrigger,
  Chevron: MenuChevron,
  Link: MenuLink,
  Button: MenuButton,
  ThemeToggle: MenuThemeToggle,
  Header: Object.assign(MenuHeader, {
    Name: MenuHeaderName,
    Email: MenuHeaderEmail,
    Role: MenuHeaderRole,
  }),
});
