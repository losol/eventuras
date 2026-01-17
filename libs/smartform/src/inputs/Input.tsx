import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input as BaseInput } from '@eventuras/ratio-ui/forms';
import type { ComponentProps } from 'react';

interface SmartInputProps extends ComponentProps<typeof BaseInput> {
  name: string;
  validation?: any;
}

/**
 * Input component for react-hook-form integration.
 *
 * This is a lightweight input primitive integrated with react-hook-form.
 * It registers the input with the form and handles validation automatically.
 *
 * For a complete form field with label, description, and errors, see `TextField`.
 *
 * @example
 * ```tsx
 * <Input
 *   name="email"
 *   placeholder="you@example.com"
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, SmartInputProps>((props, ref) => {
  const { name, validation, ...restProps } = props;
  const formContext = useFormContext();

  // Guard against missing form context
  if (!formContext) {
    return null;
  }

  const { register } = formContext;
  const registrationProps = register(name, validation);

  return (
    <BaseInput
      {...restProps}
      {...registrationProps}
      ref={(e: HTMLInputElement) => {
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
      }}
    />
  );
});

Input.displayName = 'Input';
