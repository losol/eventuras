import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TextField as BaseTextField, InputProps } from '@eventuras/ratio-ui/forms';

/**
 * TextField component for react-hook-form integration.
 *
 * This is a complete form field with label, description, input, and error messages,
 * integrated with react-hook-form for automatic registration and validation.
 *
 * For a simpler input primitive without the wrapper, see `Input`.
 *
 * @example
 * ```tsx
 * <TextField
 *   name="email"
 *   label="Email Address"
 *   validation={{ required: 'Email is required' }}
 *   placeholder="you@example.com"
 * />
 * ```
 */
export const TextField = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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

  // Use TextField from @eventuras/ratio-ui/forms with the prepared props
  return <BaseTextField {...inputProps} />;
});

TextField.displayName = 'TextField';
