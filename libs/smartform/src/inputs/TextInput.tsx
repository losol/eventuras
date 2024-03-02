'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

import { InputProps } from '@eventuras/forms/InputProps';

import formStyles from '../../../forms/src/styles/formStyles';
import { InputLabel } from '@eventuras/forms';

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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
    dataTestId,
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
      {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}
      {description && <p className={formStyles.inputDescription}>{description}</p>}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        className={inputClassName}
        aria-invalid={hasError}
        disabled={disabled}
        data-test-id={dataTestId}
        {...register(name, validation)}
        ref={e => {
          // Assign the ref from forwardRef
          if (typeof ref === 'function') {
            ref(e);
          } else if (ref) {
            ref.current = e;
          }

          // Also call the register function
          register(name, validation).ref(e);
        }}
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
});

TextInput.displayName = 'TextInput';
export default TextInput;
