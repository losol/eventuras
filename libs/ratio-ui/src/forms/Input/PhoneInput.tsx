'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { Label } from '../common/Label';
import { InputDescription } from '../common/InputDescription';
import { InputError } from '../common/InputError';
import { COUNTRY_CODES } from './PhoneInputCountryCodes';

/** See PhoneInputProps.countries */
export interface CountryCode {
  /** Country display name, e.g. "Norway" */
  name: string;
  /** Calling code, unique key, e.g. "+47" */
  code: string;
  /** Flag emoji */
  flag: string;
}

/** See PhoneInputProps.onChange */
export interface PhoneInputChange {
  /** Full E.164-like number, e.g. "+4712345678" */
  fullNumber: string;
  /** National part only */
  localNumber: string;
  /** Selected country (or null) */
  country: CountryCode | null;
}

/** Phone input with RAC ComboBox country selector */
export interface PhoneInputProps {
  /** Form field name */
  name?: string;
  /** Visible label */
  label?: string;
  /** Help text */
  description?: string;
  /** Default calling code key (e.g. "+47") */
  defaultCode?: string;
  /** Custom country list (defaults to COUNTRY_CODES) */
  countries?: CountryCode[];
  /** Full international phone number (controlled) */
  value?: string;
  /** Field errors map */
  errors?: Record<string, { message: string } | undefined>;
  /** Disable inputs */
  disabled?: boolean;
  /** Change callback with parsed parts */
  onChange?: (value: PhoneInputChange) => void;
  /** Test ID for the phone number input */
  testId?: string;
}

// Basic phone validation rules
const PHONE_VALIDATION_RULES: Record<string, { min?: number; max?: number; exact?: number; message: string }> = {
  '+47': { exact: 8, message: 'Norwegian phone numbers must be exactly 8 digits' },
  '+46': { min: 7, max: 13, message: 'Swedish phone numbers must be 7 to 13 digits' },
  '+45': { exact: 8, message: 'Danish phone numbers must be exactly 8 digits' },
};

// Memoized country item component to prevent unnecessary re-renders
const CountryItem = React.memo(({ country, stableId }: { country: CountryCode; stableId: string }) => (
  <ListBoxItem
    key={stableId}
    id={stableId}
    textValue={`${country.flag} ${country.code} ${country.name}`}
    className={componentStyles.listBoxItem}
  >
    <span className="text-lg mr-2">{country.flag}</span>
    <span className={textStyles.listBoxItemPrimary}>{country.code}</span>
    <span className={`${textStyles.listBoxItemSecondary} ml-2`}>{country.name}</span>
  </ListBoxItem>
));

CountryItem.displayName = 'CountryItem';

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
  testId,
}: PhoneInputProps) {
  // Memoize default country calculation
  const defaultCountry = useMemo(
    () => countries.find((c) => c.code === defaultCode) || countries[0] || { name: '', code: '', flag: '' },
    [countries, defaultCode]
  );

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [localNumber, setLocalNumber] = useState('');
  const [comboInputValue, setComboInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Memoize emit change function
  const emitChange = useCallback(
    (selectedCountry: CountryCode | null, number: string) => {
      const fullNumber = selectedCountry ? `${selectedCountry.code}${number}` : number;
      onChange?.({
        fullNumber,
        localNumber: number,
        country: selectedCountry,
      });
    },
    [onChange]
  );

  // Parse incoming value
  useEffect(() => {
    if (!value) {
      setLocalNumber('');
      return;
    }

    const matchedCountry = countries.find((c) => value.startsWith(c.code));
    if (matchedCountry) {
      setCountry(matchedCountry);
      setLocalNumber(value.slice(matchedCountry.code.length));
    } else {
      setCountry(defaultCountry);
      setLocalNumber(value.replace(/^\+/, ''));
    }
  }, [value, countries, defaultCountry]);

  // Update ComboBox input value when country changes
  useEffect(() => {
    setComboInputValue(country.code);
  }, [country]);

  // Change handlers
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/\D/g, '');
      setLocalNumber(cleaned);
      setLocalError(null);
      emitChange(country, cleaned);
    },
    [country, emitChange]
  );

  const handleNumberBlur = useCallback(() => {
    if (!localNumber) {
      setLocalError(null);
      return;
    }

    const rule = PHONE_VALIDATION_RULES[country.code];
    let error: string | null = null;

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
      // Generic validation
      if (localNumber.length < 6) {
        error = 'Phone number must be at least 6 digits';
      } else if (localNumber.length > 15) {
        error = 'Phone number must be at most 15 digits';
      }
    }

    setLocalError(error);
  }, [country.code, localNumber]);

  const handleCountryChange = useCallback(
    (key: React.Key | null) => {
      if (!key || key === 'no-results') {
        emitChange(null, localNumber);
        return;
      }
      // Parse stable ID format: "code:country_name"
      const keyStr = String(key);
      const [code, encodedName] = keyStr.split(':');
      const name = encodedName?.replace(/_/g, ' ');
      const selectedCountry = countries.find((c) => c.code === code && c.name === name) || null;

      if (selectedCountry) {
        setCountry(selectedCountry);
      }
      emitChange(selectedCountry, localNumber);
    },
    [countries, emitChange, localNumber]
  );

  const handleInputChange = useCallback((val: string) => {
    // Allow free typing for filtering; we reset later if needed
    setComboInputValue(val);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        // When dropdown closes, reset to show only country code
        setComboInputValue(country.code);
      }
    },
    [country]
  );

  // --- NEW: helper to commit typed codes like "+47" or "47" ---
  const commitTypedCountryCode = useCallback(
    (raw: string): boolean => {
      const typed = raw.trim();
      if (!typed) return false;

      // Normalize "47" -> "+47"
      const normalized = typed.startsWith('+') ? typed : `+${typed}`;

      const matched = countries.find((c) => c.code.toLowerCase() === normalized.toLowerCase());
      if (matched) {
        if (matched.code !== country.code) {
          setCountry(matched);
          emitChange(matched, localNumber);
        }
        // Ensure input shows the canonical code
        setComboInputValue(matched.code);
        return true;
      }
      return false;
    },
    [countries, country.code, emitChange, localNumber]
  );

  // Commit on blur; otherwise snap back to current code
  const handleInputBlur = useCallback(() => {
    if (!commitTypedCountryCode(comboInputValue)) {
      setComboInputValue(country.code);
    }
  }, [commitTypedCountryCode, comboInputValue, country.code]);

  // Filter countries list based on typed query
  const filteredCountries = useMemo(() => {
    const query = comboInputValue.trim().toLowerCase();
    if (!query || query === country.code.toLowerCase()) {
      return countries;
    }
    return countries.filter(
      (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
    );
  }, [countries, comboInputValue, country.code]);

  // Stable selected key for ComboBox
  const selectedKey = useMemo(() => {
    return country.code && country.name ? `${country.code}:${country.name.replace(/\s+/g, '_')}` : null;
  }, [country.code, country.name]);

  // Render countries
  const renderedCountries = useMemo(() => {
    return filteredCountries.map((countryItem) => {
      const stableId = `${countryItem.code}:${countryItem.name.replace(/\s+/g, '_')}`;
      return <CountryItem key={stableId} country={countryItem} stableId={stableId} />;
    });
  }, [filteredCountries]);

  return (
    <div className={formStyles.inputWrapper}>
      {label && <Label>{label}</Label>}
      {description && <InputDescription>{description}</InputDescription>}

      <div className={`${componentStyles.phoneInputContainer} flex items-stretch`}>
        {/* Country Selector */}
        <ComboBox
          selectedKey={selectedKey}
          inputValue={comboInputValue}
          onSelectionChange={handleCountryChange}
          onInputChange={handleInputChange}
          onOpenChange={handleOpenChange}
          className={`${componentStyles.integratedComboBoxContainer} min-w-16 max-w-24`}
          allowsCustomValue={false}
          isDisabled={disabled}
          aria-label="Select country code"
          menuTrigger="input"
        >
          <div className={componentStyles.comboBoxInputWrapper}>
            <ComboBoxInput
              className={componentStyles.comboBoxInputField}
              placeholder="Select country"
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                // Commit typed code on Tab or Enter before focus leaves/selection changes
                if (e.key === 'Tab' || e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  commitTypedCountryCode(val);
                  // Do not prevent default; we just ensure state is updated in time.
                }
              }}
            />
            <ComboBoxButton className={`px-2 ${textStyles.dropdownButton}`}>▾</ComboBoxButton>
          </div>

          <Popover className={`${componentStyles.popover} max-h-60 overflow-hidden`}>
            <ListBox className="max-h-60 overflow-y-auto">
              {renderedCountries}
              {filteredCountries.length === 0 && (
                <ListBoxItem
                  id="no-results"
                  textValue="No countries found"
                  className={`px-3 py-2 ${textStyles.emptyStateText}`}
                  isDisabled
                >
                  No countries found
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </ComboBox>

        {/* Phone Number Input */}
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
          data-testid={testId}
        />
      </div>

      {/* Error Display */}
      {(localError || errors?.[name]?.message) && (
        <InputError errors={{ [name]: { message: localError || errors?.[name]?.message || '' } }} name={name} />
      )}
    </div>
  );
}
