import React from 'react';

type ErrorProps = {
  errors?: { [key: string]: { message: string } | undefined };
  name: string;
  className?: string;
};

const InputError: React.FC<ErrorProps> = ({ errors, name, className = 'text-red-500' }) => {
  const errorMessage = errors?.[name]?.message;

  if (!errorMessage) return null;

  return (
    <label htmlFor={name} role="alert" className={className}>
      {errorMessage}
    </label>
  );
};

export { InputError };
