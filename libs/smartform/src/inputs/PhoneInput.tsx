'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PhoneInput as CorePhoneInput, PhoneInputProps } from '@eventuras/ratio-ui/forms/Input/PhoneInput';

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

  return (
    <Controller
      name={name}
      control={control}
      rules={validation}
      render={({ field, fieldState }) => (
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
      )}
    />
  );
};
