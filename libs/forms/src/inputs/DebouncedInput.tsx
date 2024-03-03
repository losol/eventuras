import React from "react";
import { formStyles } from "../styles/formStyles";

export const DebouncedInput = ({
  value: initialValue,
  onChange,
  className,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      className={className ?? formStyles.defaultInputStyle}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
};
