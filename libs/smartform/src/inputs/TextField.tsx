import React from 'react';
import { useController, useFormContext, type RegisterOptions } from 'react-hook-form';
import { TextField as BaseTextField } from '@eventuras/ratio-ui/forms';
import type { InputFieldProps } from '@eventuras/ratio-ui/forms';

export const TextField = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, 'defaultValue' | 'onChange' | 'onBlur' | 'value' | 'ref' | 'errors'> & {
    name: string;
    validation?: RegisterOptions;
  }
>(({ label, name, validation, ...restProps }, forwardedRef) => {
    const formContext = useFormContext();

    const {
      field,
      fieldState: { error },
      formState,
    } = useController({
      name,
      control: formContext.control,
      rules: validation,
    });

    return (
      <BaseTextField
        name={name}
        {...restProps}
        label={label}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        // Keep RHF's ref, and also forward to parent ref
        ref={(el: HTMLInputElement | null) => {
          field.ref(el);
          if (typeof forwardedRef === 'function') forwardedRef(el);
          else if (forwardedRef && 'current' in forwardedRef) forwardedRef.current = el;
        }}
        aria-invalid={error ? true : undefined}
        // If BaseTextField insists on the whole errors object, give it that:
        errors={formState.errors}
      />
    );
  }
);

TextField.displayName = 'TextField';
