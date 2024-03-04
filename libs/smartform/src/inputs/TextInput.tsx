import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TextInput as CoreTextInput, InputProps } from '@eventuras/forms';

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { name, validation, ...restProps } = props;
  const { register, formState: { errors } } = useFormContext();

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

  // Use CoreTextInput from @eventuras/forms with the prepared props
  return <CoreTextInput {...inputProps} />;
});

TextInput.displayName = 'TextInput';
