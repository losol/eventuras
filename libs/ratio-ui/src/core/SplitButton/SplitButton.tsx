import React, { ReactNode } from 'react';
import {
  Button as AriaButton,
  Menu as AriaMenu,
  MenuItem,
  MenuTrigger,
  Popover,
} from 'react-aria-components';
import { ChevronDown, LoaderCircle } from '../../icons';
import { buttonStyles, buttonSizes } from '../Button/Button';

export interface SplitButtonAction {
  id: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

export interface SplitButtonProps {
  /** Primary action label */
  children: ReactNode;
  /** Primary action click handler */
  onClick: () => void;
  /** Secondary actions shown in dropdown */
  actions: SplitButtonAction[];
  /** Button variant */
  variant?: keyof typeof buttonStyles;
  /** Button size */
  size?: keyof typeof buttonSizes;
  /** Show loading spinner on primary button */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Icon to show before primary label */
  icon?: ReactNode;
  /** Test ID for testing */
  testId?: string;
}

const menuItemStyles =
  'cursor-pointer flex w-full items-center gap-2 px-3 py-2 hover:bg-primary-100 dark:hover:bg-primary-900 text-gray-900 dark:text-gray-100 outline-none';

const menuStyles =
  'min-w-48 origin-top-right bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5 rounded-md overflow-hidden';

export function SplitButton({
  children,
  onClick,
  actions,
  variant = 'outline',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  testId,
}: SplitButtonProps) {
  const isDisabled = disabled || loading;
  const sizeClasses = buttonSizes[size];
  const variantClasses = buttonStyles[variant];

  // Extract padding from size for consistent styling (only px- and py- classes)
  const paddingClasses = sizeClasses.split(' ').filter(c => c.startsWith('px-') || c.startsWith('py-')).join(' ');
  const textClass = sizeClasses.split(' ').find(c => c.startsWith('text-')) ?? '';

  const baseClasses = `${variantClasses} ${textClass}`.replace('rounded-full', '');
  const disabledClasses = isDisabled ? 'opacity-75 cursor-not-allowed' : '';

  return (
    <div className="inline-flex rounded-full overflow-hidden" data-testid={testId}>
      {/* Primary action button */}
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`${baseClasses} ${paddingClasses} ${disabledClasses} rounded-l-full border-r-0 flex items-center gap-2`}
      >
        {loading ? (
          <LoaderCircle className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
      </button>

      {/* Dropdown trigger */}
      <MenuTrigger>
        <AriaButton
          isDisabled={isDisabled}
          className={`${baseClasses} px-2 ${disabledClasses} rounded-r-full border-l border-l-gray-400/30 flex items-center`}
        >
          <ChevronDown className="h-4 w-4" />
        </AriaButton>
        <Popover placement="bottom end">
          <AriaMenu
            className={menuStyles}
            onAction={key => {
              const action = actions.find(a => a.id === key);
              if (action) action.onClick();
            }}
          >
            {actions.map(action => (
              <MenuItem key={action.id} id={action.id} className={menuItemStyles}>
                {action.icon && <span className="shrink-0">{action.icon}</span>}
                <span>{action.label}</span>
              </MenuItem>
            ))}
          </AriaMenu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}

export default SplitButton;
