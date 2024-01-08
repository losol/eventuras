'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

import { InputProps } from '@/components/forms/src/inputs/InputProps';

import formStyles from '../formStyles';

export const TextInput: React.FC<InputProps> = props => {
  const {
    id,
    name,
    type = 'text',
    placeholder,
    label,
    description,
    className,
    validation,
    disabled,
    ...rest
  } = props;
  const inputId = id ?? name;
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const hasError = !!errors[name];
  let inputClassName = className ?? formStyles.defaultInputStyle;
  if (hasError) {
    inputClassName = `${inputClassName} ${formStyles.inputErrorGlow}`;
  }
  if (disabled) {
    inputClassName = `${inputClassName} cursor-not-allowed`;
  }
  return (
    <div className="my-6">
      {label && (
        <label htmlFor={inputId} className="block font-bold mb-2">
          {label}
        </label>
      )}
      {description && <p className={formStyles.inputDescription}>{description}</p>}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        className={inputClassName}
        aria-invalid={hasError}
        disabled={disabled}
        {...register(name, validation)}
        {...rest}
      />
      {/* check this a11y guide : https://www.react-hook-form.com/advanced-usage/#AccessibilityA11y */}
      {errors && errors[name] && (
        <label htmlFor={inputId} role="alert" className="text-red-500">
          {errors[name]?.message?.toString()}
        </label>
      )}
    </div>
  );
};

export default TextInput;
