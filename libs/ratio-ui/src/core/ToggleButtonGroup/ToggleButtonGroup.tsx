import React from 'react';
import { ToggleButton } from 'react-aria-components';

export interface ToggleButtonOption {
  value: string;
  label: string;
  count?: number;
}

export interface ToggleButtonGroupProps {
  options: ToggleButtonOption[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  'aria-label'?: string;
}

export function ToggleButtonGroup({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: Readonly<ToggleButtonGroupProps>) {
  return (
    <fieldset aria-label={ariaLabel} className="flex border-0 p-0 m-0">
      {options.map(option => (
        <ToggleButton
          key={option.value}
          isSelected={value === option.value}
          onChange={(isSelected) => onChange?.(isSelected ? option.value : null)}
          className="px-3 py-1.5 border border-border-1 bg-card hover:bg-card-hover hover:z-10 selected:border-(--primary) selected:bg-primary-100 dark:selected:bg-primary-800 selected:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:z-30 first:rounded-l last:rounded-r -ml-px first:ml-0 relative"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{option.label}</span>
            {option.count !== undefined && (
              <span className="text-xs font-medium text-(--text-subtle)">({option.count})</span>
            )}
          </div>
        </ToggleButton>
      ))}
    </fieldset>
  );
}

