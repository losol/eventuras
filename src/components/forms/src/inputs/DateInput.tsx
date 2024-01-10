import React from 'react';
import { useFormContext } from 'react-hook-form';

import { InputProps } from '@/components/forms/src/inputs/InputProps';

import Label from './Label';

const styles = {
  input: 'text-black dark:text-white bg-slate-100 dark:bg-slate-700 p-2 m-2',
};

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { register } = useFormContext();
  const id = props.id ?? props.name;

  return (
    <div className="mb-3">
      <Label htmlFor={id}>{props.label}</Label>
      <input
        id={id}
        className={styles.input}
        type="date"
        placeholder={props.placeholder}
        {...register(props.name, props.validation)}
        ref={e => {
          // Assign the ref from forwardRef
          if (typeof ref === 'function') {
            ref(e);
          } else if (ref) {
            ref.current = e;
          }

          // Also call the register function
          register(props.name, props.validation).ref(e);
        }}
      />
      {props.errors && (
        <label htmlFor={id} role="alert" className="text-red-500">
          {props.errors[props.name]?.message}
        </label>
      )}
    </div>
  );
});
DateInput.displayName = 'DateInput';
