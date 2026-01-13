import React, { type ComponentPropsWithoutRef } from 'react';

import clsx from 'clsx';
import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Text,
} from 'react-aria-components';

import { Minus, Plus } from '../../icons';

export type NumberFieldVariant = 'separated' | 'segmented';
export type NumberFieldSize = 'sm' | 'md' | 'lg';

export interface NumberFieldProps
  extends Omit<AriaNumberFieldProps, 'children' | 'className'> {
  label?: string;
  description?: string;
  errorMessage?: string;

  variant?: NumberFieldVariant;
  size?: NumberFieldSize;

  className?: string;
  testId?: string;
}

const styles = {
  wrapper: 'flex flex-col gap-1 w-full',
  label: 'text-sm font-medium text-gray-900 dark:text-gray-100 cursor-default',

  description: 'text-sm text-gray-600 dark:text-gray-400',
  error: 'text-sm text-red-600 dark:text-red-400',

  separatedGroup: 'flex items-center gap-2',
  separatedButton: [
    'flex items-center justify-center',
    'rounded-md',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'text-gray-700 dark:text-gray-300',
    'hover:bg-gray-50 dark:hover:bg-gray-700',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-colors',
  ].join(' '),
  separatedInput: [
    'w-16 text-center',
    'rounded-md',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  segmentedGroup: [
    'inline-flex items-stretch',
    'overflow-hidden rounded-lg',
    'border border-gray-300 dark:border-gray-600',
  ].join(' '),
  segmentedButton: [
    'flex items-center justify-center',
    'bg-transparent',
    'text-gray-700 dark:text-gray-300',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-colors',
  ].join(' '),
  segmentedInput: [
    'w-16 text-center',
    'border-x border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-900',
    'text-gray-900 dark:text-gray-100',
    'font-semibold',
    'focus:outline-none',
  ].join(' '),
} as const;

const sizeConfig = {
  sm: {
    separatedButton: 'h-8 w-8',
    separatedInput: 'h-8 text-sm',
    segmentedButton: 'px-4 py-3',
    segmentedInput: 'px-6 py-3 text-sm',
    icon: 'h-4 w-4',
  },
  md: {
    separatedButton: 'h-9 w-9',
    separatedInput: 'h-9 text-sm',
    segmentedButton: 'px-4 py-3',
    segmentedInput: 'px-6 py-3 text-sm',
    icon: 'h-5 w-5',
  },
  lg: {
    separatedButton: 'h-10 w-10',
    separatedInput: 'h-10 text-base',
    segmentedButton: 'px-5 py-4',
    segmentedInput: 'px-7 py-4 text-base',
    icon: 'h-5 w-5',
  },
} as const;

/**
 * NumberField wrapper built on React Aria Components.
 *
 * API is aligned with React Aria's NumberField where possible (e.g. `minValue`, `maxValue`, `step`,
 * `formatOptions`, `value`/`defaultValue`, `onChange`, `decrementAriaLabel`, `incrementAriaLabel`).
 */
export function NumberField({
  label,
  description,
  errorMessage,
  variant = 'separated',
  size = 'sm',
  className,
  testId,
  ...props
}: NumberFieldProps) {
  const groupClassName =
    variant === 'segmented' ? styles.segmentedGroup : styles.separatedGroup;
  const buttonClassName =
    variant === 'segmented' ? styles.segmentedButton : styles.separatedButton;
  const inputClassName =
    variant === 'segmented' ? styles.segmentedInput : styles.separatedInput;

  return (
    <AriaNumberField
      {...props}
      className={clsx(styles.wrapper, className)}
      data-testid={testId}
    >
      {label && <Label className={styles.label}>{label}</Label>}

      <Group className={groupClassName}>
        <Button
          slot="decrement"
          className={clsx(
            buttonClassName,
            variant === 'segmented'
              ? sizeConfig[size].segmentedButton
              : sizeConfig[size].separatedButton
          )}
          data-testid={testId ? `${testId}-decrement` : undefined}
        >
          <Minus className={sizeConfig[size].icon} aria-hidden="true" />
        </Button>

        <Input
          className={clsx(
            inputClassName,
            variant === 'segmented'
              ? sizeConfig[size].segmentedInput
              : sizeConfig[size].separatedInput
          )}
          data-testid={testId ? `${testId}-input` : undefined}
        />

        <Button
          slot="increment"
          className={clsx(
            buttonClassName,
            variant === 'segmented'
              ? sizeConfig[size].segmentedButton
              : sizeConfig[size].separatedButton
          )}
          data-testid={testId ? `${testId}-increment` : undefined}
        >
          <Plus className={sizeConfig[size].icon} aria-hidden="true" />
        </Button>
      </Group>

      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}

      {errorMessage && (
        <FieldError className={styles.error}>{errorMessage}</FieldError>
      )}
    </AriaNumberField>
  );
}

export default NumberField;
