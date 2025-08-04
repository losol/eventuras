'use client';

import React, { useState, useEffect } from 'react';
import {
  ComboBox,
  Input as ComboBoxInput,
  ListBox,
  ListBoxItem,
  Button as ComboBoxButton,
  Popover,
} from 'react-aria-components';
import { Input } from './Input';
import { formStyles, textStyles, componentStyles } from '../styles/formStyles';
import { InputLabel } from '../common/InputLabel';
import { InputDescription } from '../common/InputDescription';
import { InputError } from '../common/InputError';
import { COUNTRY_CODES } from './PhoneInputCountryCodes';

export interface CountryCode {
  name: string;
  code: string;
  flag: string;
}

export interface PhoneInputChange {
  fullNumber: string;
  localNumber: string;
  country: CountryCode | null;
}

export interface PhoneInputProps {
  name?: string;
  label?: string;
  description?: string;
  defaultCode?: string;
  countries?: CountryCode[];
  /** Full international phone number, e.g. +4712345678 */
  value?: string;
  errors?: Record<string, { message: string } | undefined>;
  disabled?: boolean;
  onChange?: (value: PhoneInputChange) => void;
}

export function PhoneInput({
  name = 'phone',
  label = 'Phone Number',
  description,
  defaultCode = '+47',
  countries = COUNTRY_CODES,
  value,
  errors,
  disabled,
  onChange,
}: PhoneInputProps) {
  const defaultCountry =
    countries.find((c) => c.code === defaultCode) ??
    countries[0] ??
    { name: '', code: '', flag: '' };

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [localNumber, setLocalNumber] = useState('');
  const [comboInputValue, setComboInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Emit combined number to parent
  const emitChange = (c: CountryCode | null, number: string) => {
    const code = c?.code ?? '';
    const fullNumber = `${code}${number}`.trim();
    onChange?.({ fullNumber, localNumber: number, country: c });
  };

  // 🔹 Split existing full number on mount or when `value` changes
  useEffect(() => {
    if (!value) return;

    const match = countries.find((c) => value.startsWith(c.code));
    if (match) {
      setCountry(match);
      setLocalNumber(value.slice(match.code.length));
    } else {
      // fallback: unknown prefix
      setLocalNumber(value.replace(/^\+/, ''));
    }
  }, [value]);

  // Handle typing in local number (digits only)
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/\D/g, ''); // Only digits
    setLocalNumber(cleanedValue);
    setLocalError(null); // Clear while typing
    emitChange(country, cleanedValue);
  };

  // Simple validation per country on blur
  const phoneValidationRules: Record<
    string,
    { min?: number; max?: number; exact?: number; message: string }
  > = {
    '+47': { exact: 8, message: 'Norwegian phone numbers must be exactly 8 digits' },
    '+46': { min: 7, max: 13, message: 'Swedish phone numbers must be 7 to 13 digits' },
    '+45': { exact: 8, message: 'Danish phone numbers must be exactly 8 digits' },
  };

  const handleNumberBlur = () => {
    let error: string | null = null;
    const rule = phoneValidationRules[country.code];

    if (rule) {
      if (rule.exact !== undefined && localNumber.length !== rule.exact) {
        error = rule.message;
      } else if (
        (rule.min !== undefined && localNumber.length < rule.min) ||
        (rule.max !== undefined && localNumber.length > rule.max)
      ) {
        error = rule.message;
      }
    } else {
      if (localNumber && localNumber.length < 6) {
        error = 'Phone number must be at least 6 digits';
      } else if (localNumber.length > 15) {
        error = 'Phone number must be at most 15 digits';
      }
    }

    setLocalError(error);
  };

  // Handle country selection
  const handleCountryChange = (key: React.Key | null) => {
    if (!key) return;
    const selected = countries.find((c) => c.name === key);
    if (selected) {
      setCountry(selected);
      emitChange(selected, localNumber);
    }
  };

  // ComboBox filter value
  const handleInputChange = (value: string) => {
    setComboInputValue(value);
  };

  // Filter countries in dropdown
  const filteredCountries = countries.filter((c) => {
    if (!comboInputValue) return true;
    const searchTerm = comboInputValue.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchTerm) ||
      c.code.includes(searchTerm) ||
      c.flag.includes(searchTerm)
    );
  });

  return (
    <div className={formStyles.inputWrapper}>
      {label && <InputLabel>{label}</InputLabel>}
      {description && <InputDescription>{description}</InputDescription>}

      <div className={`${componentStyles.phoneInputContainer} flex items-stretch`}>
        {/* Left: Country selector */}
        <ComboBox
          selectedKey={country.name}
          inputValue={comboInputValue}
          onSelectionChange={handleCountryChange}
          onInputChange={handleInputChange}
          className={componentStyles.integratedComboBoxContainer}
          allowsCustomValue={false}
        >
          <div className={componentStyles.comboBoxInputWrapper}>
            <ComboBoxInput
              className={componentStyles.comboBoxInputField}
              // Only show flag and code as placeholder and in input
              placeholder={`${country.flag} ${country.code}`}
              // Show only flag and code in input field (if supported by ComboBoxInput)
            />
            <ComboBoxButton className={`px-2 ${textStyles.dropdownButton}`}>
              ▾
            </ComboBoxButton>
          </div>
          <Popover className={componentStyles.popover}>
            <ListBox>
              {filteredCountries.map((c) => (
                <ListBoxItem
                  key={c.name}
                  id={c.name}
                  // Only show flag and code as visible label in input (textValue)
                  textValue={`${c.flag} ${c.code}`}
                  className={componentStyles.listBoxItem}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className={textStyles.listBoxItemPrimary}>{c.code}</span>
                  <span className={textStyles.listBoxItemSecondary}>{c.name}</span>
                </ListBoxItem>
              ))}
              {filteredCountries.length === 0 && (
                <div className={`px-3 py-2 ${textStyles.emptyStateText}`}>
                  No countries found
                </div>
              )}
            </ListBox>
          </Popover>
        </ComboBox>

        {/* Right: local number input */}
        <Input
          name={name}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localNumber}
          onChange={handleNumberChange}
          onBlur={handleNumberBlur}
          disabled={disabled}
          placeholder="Enter phone number"
          className="p-2 bg-gray-50 dark:bg-gray-900 border-0 rounded-none focus:ring-0 flex-1 w-full"
          noWrapper
        />
      </div>

      {(localError || errors?.[name]?.message) && (
        <InputError
          errors={{
            [name]: { message: localError ?? errors?.[name]?.message ?? '' },
          }}
          name={name}
        />
      )}
    </div>
  );
}
