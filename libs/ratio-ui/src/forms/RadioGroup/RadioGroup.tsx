import type { ReactNode } from 'react';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  price?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  /** Unique name for the radio group */
  name: string;
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Array of radio options */
  options: RadioOption<T>[];
  /** Optional label for the group */
  label?: string;
  /** Optional error message */
  error?: string;
  /** Custom class name */
  className?: string;
  /** Disable all options */
  disabled?: boolean;
}

/**
 * RadioGroup component for selecting a single option from a list
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   name="shipping"
 *   value={selectedShipping}
 *   onChange={setSelectedShipping}
 *   options={[
 *     { value: 'standard', label: 'Standard Shipping', price: '59 kr' },
 *     { value: 'express', label: 'Express Shipping', price: '99 kr' },
 *     { value: 'pickup', label: 'Store Pickup', price: 'Free' },
 *   ]}
 * />
 * ```
 */
export function RadioGroup<T extends string = string>({
  name,
  value,
  onChange,
  options,
  label,
  error,
  className = '',
  disabled = false,
}: RadioGroupProps<T>) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex-1 flex items-start gap-3">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => !isDisabled && onChange(e.target.value as T)}
                  disabled={isDisabled}
                  className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span
                    className={`block text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className={`block text-xs mt-1 ${
                        isSelected
                          ? 'text-blue-100 dark:text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {option.description}
                    </span>
                  )}
                </div>
              </div>

              {option.price && (
                <span
                  className={`text-sm font-semibold ml-3 ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {option.price}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
