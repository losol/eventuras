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
          className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 selected:border-blue-500 selected:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 first:rounded-l last:rounded-r -ml-px first:ml-0"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{option.label}</span>
            {option.count !== undefined && (
              <span className="text-xs font-medium text-gray-500">({option.count})</span>
            )}
          </div>
        </ToggleButton>
      ))}
    </fieldset>
  );
}

export default ToggleButtonGroup;

