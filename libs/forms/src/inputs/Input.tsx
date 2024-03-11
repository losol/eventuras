import React from "react";
import { InputProps } from "./InputProps";
import { formStyles } from "../styles/formStyles";
import { InputLabel } from "../common/InputLabel";
import { InputError } from "../common/InputError";
import { InputDescription } from "../common/InputDescription";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  name,
  type = 'text',
  placeholder,
  label,
  description,
  className,
  errors,
  disabled,
  dataTestId,
  ...rest
}, ref) => {

  const hasError = errors && errors[name] ? true : false;

  let inputClassName = `${className ?? formStyles.defaultInputStyle} ${hasError ? formStyles.inputErrorGlow : ''} ${disabled ? 'cursor-not-allowed' : ''}`;

  const id = rest.id ?? name;

  return (
    <div className={formStyles.inputWrapper}>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      {description && <InputDescription>{description}</InputDescription>}
      <input
        id={id}
        ref={ref}
        className={inputClassName}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        data-test-id={dataTestId}
        name={name}
        {...rest}
      />
      {hasError && <InputError errors={errors} name={name} />}
    </div>
  );
});

Input.displayName = 'TextInput';
