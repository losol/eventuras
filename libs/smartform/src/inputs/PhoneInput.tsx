'use client';

import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import {PhoneInput as CorePhoneInput, PhoneInputProps} from '@eventuras/ratio-ui/forms/Input';

interface SmartformPhoneInputProps extends Omit<PhoneInputProps, 'onChange'> {
  name: string;
  validation?: any;
}

export const PhoneInput: React.FC<SmartformPhoneInputProps> = ({
  name,
  validation,
  ...props
}) => {
  const { control } = useFormContext();

  const { field, fieldState } = useController({
    name,
    control,
    rules: validation,
  });

  return (
    <CorePhoneInput
      {...props}
      name={name}
      value={field.value || ''}
      onChange={({ fullNumber }: { fullNumber: string }) => field.onChange(fullNumber)}
      errors={
        fieldState.error
          ? { [name]: { message: fieldState.error.message || '' } }
          : {}
      }
    />
  );
};
