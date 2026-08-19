import React from 'react';
import { useFormContext } from 'react-hook-form';

import { formStyles, Label, InputProps } from '@eventuras/ratio-ui/forms';

export type NumberInputProps = InputProps & {
  /**
   * Render as a numeric text field without spinner arrows — for identifiers
   * like account numbers, where an accidental step changes the meaning.
   */
  noSpinner?: boolean;
};

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
  const {
    id,
    name,
    placeholder,
    label,
    description,
    className,
    defaultValue,
    validation,
    disabled,
    noSpinner,
  } = props;
  const inputId = id ?? name;
  const formContext = useFormContext();

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

  // Register exactly once, with conversion and validation merged — a second
  // register() call would overwrite the first one's options.
  const { ref: registerRef, ...registration } = register(name, {
    ...(noSpinner
      ? { setValueAs: v => (v === '' || v === null || v === undefined ? undefined : Number(v)) }
      : { valueAsNumber: true }),
    ...validation,
  });

  return (
    <div className="my-6">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {description && <p className={formStyles.inputDescription}>{description}</p>}

      <input
        id={inputId}
        type={noSpinner ? 'text' : 'number'}
        inputMode={noSpinner ? 'numeric' : undefined}
        placeholder={placeholder}
        className={inputClassName}
        aria-invalid={hasError}
        disabled={disabled}
        data-testid={props.testId}
        defaultValue={defaultValue}
        // Scrolling past a focused number input must not change its value.
        onWheel={e => e.currentTarget.blur()}
        {...registration}
        ref={e => {
          if (typeof ref === 'function') {
            ref(e);
          } else if (ref) {
            ref.current = e;
          }
          registerRef(e);
        }}
      />
      {errors?.[name] && (
        <label htmlFor={inputId} role="alert" className="text-red-500">
          {errors[name]?.message?.toString()}
        </label>
      )}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';
export default NumberInput;
