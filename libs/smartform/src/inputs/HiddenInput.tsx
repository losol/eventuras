import React from 'react';
import { useFormContext } from 'react-hook-form';

interface HiddenInputProps {
  name: string;
  value: string;
}

const HiddenInput: React.FC<HiddenInputProps> = ({ name, value }) => {
  const formContext = useFormContext();

  // Log and guard against missing form context
  if (!formContext) {
    console.warn(`HiddenInput (${name}): Form context is null - component may not be inside a FormProvider`);
    return null;
  }

  const { register } = formContext;

  return <input type="hidden" value={value} {...register(name)} />;
};

export default HiddenInput;
