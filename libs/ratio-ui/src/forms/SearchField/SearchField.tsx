'use client';

import React, { useEffect, useState } from 'react';
import {
  SearchField as AriaSearchField,
  Input,
  Button,
} from 'react-aria-components';
import { formStyles } from '../styles/formStyles';

export interface SearchFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
  className?: string;
  isDisabled?: boolean;
  /** Debounce delay in milliseconds. Default: 300ms */
  debounce?: number;
}

/**
 * SearchField component - A search input with clear button and proper semantics.
 *
 * Built on React Aria's SearchField for accessibility and UX best practices.
 * Includes automatic debouncing (300ms default) and a clear button.
 *
 * @example
 * ```tsx
 * <SearchField
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search..."
 *   aria-label="Search products"
 *   debounce={500}
 * />
 * ```
 */
export const SearchField = React.forwardRef<HTMLDivElement, SearchFieldProps>(
  (
    {
      value: externalValue = '',
      onChange,
      onSubmit,
      placeholder = 'Search...',
      'aria-label': ariaLabel,
      className,
      isDisabled,
      debounce = 300,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(externalValue);

    // Sync external value to internal
    useEffect(() => {
      setInternalValue(externalValue);
    }, [externalValue]);

    // Debounced onChange
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (onChange && internalValue !== externalValue) {
          onChange(internalValue);
        }
      }, debounce);

      return () => clearTimeout(timeout);
    }, [internalValue, debounce]);

    return (
      <AriaSearchField
        value={internalValue}
        onChange={setInternalValue}
        onSubmit={onSubmit}
        isDisabled={isDisabled}
        aria-label={ariaLabel}
        className={className}
        ref={ref}
      >
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <Input
            placeholder={placeholder}
            className={`${formStyles.defaultInputStyle} pl-10`}
          />
        </div>
      </AriaSearchField>
    );
  }
);

SearchField.displayName = 'SearchField';
