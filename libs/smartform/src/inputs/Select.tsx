import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { Select as RatioSelect } from "@eventuras/ratio-ui/forms";

export type SelectProps = {
  label?: string;
  name: string;
  options: { value: string; label: string }[];
  testId?: string;
};

const Select: React.FC<SelectProps> = ({ label, name, options, testId }) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <RatioSelect
      label={label}
      options={options}
      value={field.value}
      onSelectionChange={(value) => {
        field.onChange(value);
      }}
      onBlur={field.onBlur}
      testId={testId}
    />
  );
};

export default Select;
