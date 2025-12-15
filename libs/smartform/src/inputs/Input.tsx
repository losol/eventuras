import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input as BaseInput, InputProps } from '@eventuras/ratio-ui/forms';

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { name, validation, ...restProps } = props;
  const formContext = useFormContext();

  // Guard against missing form context
  if (!formContext) {
    return null;
  }

  const { register, formState: { errors } } = formContext;

  const hasError = !!errors[name];

  const registrationProps = register(name, validation);

  const inputProps = {
    ...restProps,
    ...registrationProps,
    ref: (e: HTMLInputElement) => {
      // Assign the input element to the forwarded ref
      if (typeof ref === 'function') {
        ref(e);
      } else if (ref && 'current' in ref) {
        ref.current = e;
      }
      // Ensure registrationProps.ref is called if it exists
      if (registrationProps.ref) {
        registrationProps.ref(e);
      }
    },
    'aria-invalid': hasError ? true : undefined,
    errors: hasError ? errors[name] : undefined,
  };

  // Use CoreTextInput from @eventuras/ratio-ui/forms with the prepared props
  return <BaseInput {...inputProps} />;
});

Input.displayName = 'Input';
