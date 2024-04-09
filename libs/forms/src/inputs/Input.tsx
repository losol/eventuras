import React from "react";
import { InputProps } from "./InputProps"; // Ensure this is set up to include 'multiline'
import { formStyles } from "../styles/formStyles";
import { InputLabel } from "../common/InputLabel";
import { InputError } from "../common/InputError";
import { InputDescription } from "../common/InputDescription";

interface ExtendedInputProps extends InputProps {
  multiline?: boolean;
  rows?: number;
  cols?: number;
}

export const Input = React.forwardRef<HTMLElement, ExtendedInputProps>(({
  name,
  type = 'text',
  placeholder,
  label,
  description,
  className,
  errors,
  disabled,
  dataTestId,
  multiline = false,
  ...rest
}, forwardedRef) => {
  const hasError = errors && errors[name];

  let inputClassName = `${className ?? formStyles.defaultInputStyle} ${hasError ? formStyles.inputErrorGlow : ''} ${disabled ? 'cursor-not-allowed' : ''}`;
  if (multiline) {
    inputClassName = `${inputClassName} ${formStyles.textarea}`;
  }

  const id = rest.id ?? name;

  const assignRef = (element: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef && 'current' in forwardedRef) {
      forwardedRef.current = element;
    }
  };

  const commonProps = {
    id,
    className: inputClassName,
    placeholder,
    disabled,
    'aria-invalid': hasError ? true : undefined,
    'data-test-id': dataTestId,
    name,
    ...rest,
  };

  if (multiline) {
    commonProps['rows'] = rest.rows ?? 3;
    commonProps['cols'] = rest.cols ?? undefined;
  }

  return (
    <div className={formStyles.inputWrapper}>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      {description && <InputDescription>{description}</InputDescription>}
      {multiline ? (
        <textarea ref={assignRef} {...commonProps} />
      ) : (
        <input ref={assignRef} type={type} {...commonProps} />
      )}
      {hasError && <InputError errors={errors} name={name} />}
    </div>
  );
});

Input.displayName = 'TextInput';
