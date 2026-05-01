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
}: Readonly<RadioGroupProps<T>>) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-(--text) mb-3">
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
                  ? 'border-(--primary) bg-(--primary) text-(--text-on-primary)'
                  : 'border-border-1 hover:border-border-2 hover:bg-card-hover'
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
                  className="mt-0.5 h-4 w-4 text-(--primary) focus:ring-2 focus:ring-(--focus-ring)"
                />
                <div className="flex-1">
                  <span
                    className={`block text-sm font-medium ${
                      isSelected ? 'text-(--text-on-primary)' : 'text-(--text)'
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className={`block text-xs mt-1 ${
                        isSelected
                          ? 'text-(--text-on-primary) opacity-80'
                          : 'text-(--text-subtle)'
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
                    isSelected ? 'text-(--text-on-primary)' : 'text-(--text)'
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
        <p className="mt-2 text-sm text-error-text">{error}</p>
      )}
    </div>
  );
}
