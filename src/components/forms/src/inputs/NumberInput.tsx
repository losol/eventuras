import React from 'react';
import { useFormContext } from 'react-hook-form';

import { InputProps } from '@/components/forms/src/inputs/InputProps';

import formStyles from '../formStyles';
import Label from './Label';

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { id, name, placeholder, label, description, className, validation, disabled, dataTestId } =
    props;
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
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {description && <p className={formStyles.inputDescription}>{description}</p>}

      <input
        id={inputId}
        type="number"
        placeholder={placeholder}
        className={inputClassName}
        aria-invalid={hasError}
        disabled={disabled}
        data-test-id={dataTestId}
        {...register(name, { valueAsNumber: true })}
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
      />
      {errors && errors[name] && (
        <label htmlFor={inputId} role="alert" className="text-red-500">
          {errors[name]?.message?.toString()}
        </label>
      )}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';
export default NumberInput;
