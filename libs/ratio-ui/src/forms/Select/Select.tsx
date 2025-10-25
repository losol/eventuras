import React from 'react';
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components';
import { ChevronDown } from '../../icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onSelectionChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  testId?: string;
}

const styles = {
  wrapper: 'flex flex-col gap-1 w-full',
  label: 'text-sm font-medium text-gray-900 dark:text-gray-100 cursor-default',
  button: {
    base: [
      'w-full flex items-center justify-between gap-2',
      'px-2 py-1 rounded-lg',
      'bg-white dark:bg-gray-800',
      'border border-gray-300 dark:border-gray-600',
      'text-gray-900 dark:text-gray-100',
      'hover:border-primary-500 dark:hover:border-primary-400',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors',
    ].join(' '),
    icon: 'h-4 w-4 text-gray-500 dark:text-gray-400',
  },
  value: 'flex-1 truncate text-left placeholder-shown:italic text-gray-900 dark:text-gray-100',
  placeholder: 'text-gray-500 dark:text-gray-400',
  popover: [
    'w-[--trigger-width]',
    'mt-1 rounded-lg',
    'bg-white dark:bg-gray-800',
    'border border-gray-300 dark:border-gray-600',
    'shadow-lg',
    'overflow-hidden',
  ].join(' '),
  listBox: 'max-h-60 overflow-auto p-1',
  item: {
    base: [
      'flex items-center gap-2',
      'px-2 py-1.5 rounded-md',
      'cursor-pointer select-none',
      'text-gray-900 dark:text-gray-100',
      'outline-none',
      'transition-colors',
    ].join(' '),
    hover: 'hover:bg-primary-100 dark:hover:bg-primary-900',
    focused: 'focus:bg-primary-100 dark:focus:bg-primary-900',
    selected: 'bg-primary-50 dark:bg-primary-950 font-medium',
    disabled: 'opacity-50 cursor-not-allowed',
  },
};

/**
 * Select component built on React Aria Components
 *
 * A dropdown select component with keyboard navigation and accessibility features.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Choose a fruit"
 *   placeholder="Select..."
 *   options={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *     { value: 'orange', label: 'Orange' },
 *   ]}
 *   onSelectionChange={(value) => console.log(value)}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select...',
  options,
  value,
  defaultValue,
  onSelectionChange,
  disabled,
  required,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  testId,
}) => {
  return (
    <AriaSelect
      className={className || styles.wrapper}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onSelectionChange?.(key as string)}
      isDisabled={disabled}
      isRequired={required}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {label && <Label className={styles.label}>{label}</Label>}
      <Button className={styles.button.base} data-testid={testId}>
        <SelectValue className={styles.value}>
          {({ selectedText }) => (
            <span className={selectedText ? '' : styles.placeholder}>
              {selectedText || placeholder}
            </span>
          )}
        </SelectValue>
        <ChevronDown className={styles.button.icon} aria-hidden="true" />
      </Button>
      <Popover className={styles.popover}>
        <ListBox className={styles.listBox}>
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
              isDisabled={option.disabled}
              className={({ isFocused, isSelected, isDisabled }) =>
                [
                  styles.item.base,
                  !isDisabled && styles.item.hover,
                  isFocused && styles.item.focused,
                  isSelected && styles.item.selected,
                  isDisabled && styles.item.disabled,
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
};

export default Select;
