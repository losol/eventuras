import React from 'react';
import { useFormContext } from 'react-hook-form';

interface HiddenInputProps {
  name: string;
  value: string;
}

const HiddenInput: React.FC<HiddenInputProps> = ({ name, value }) => {
  const { register } = useFormContext();

  return <input type="hidden" value={value} {...register(name)} />;
};

export default HiddenInput;
