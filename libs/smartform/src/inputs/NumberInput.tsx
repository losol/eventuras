import React from 'react';
import { useFormContext } from 'react-hook-form';

import { formStyles, InputLabel, InputProps } from '@eventuras/ratio-ui/forms';

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { id, name, placeholder, label, description, className, defaultValue, validation, disabled } =
    props;
  const inputId = id ?? name;
  const formContext = useFormContext();

  // Guard against missing form context
  if (!formContext) {
    return null;
  }

  const {
    register,
    formState: { errors },
  } = formContext;

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
        type="number"
        placeholder={placeholder}
        className={inputClassName}
        aria-invalid={hasError}
        disabled={disabled}
        data-testid={props.testId}
        defaultValue={defaultValue}
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
