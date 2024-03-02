import React from 'react';
import { InputProps } from '../InputProps';
import { InputLabel } from '../common/InputLabel';


const DateInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const oProps = { ...props };
  delete oProps.children;
  delete oProps.type;
  delete oProps.className;
  const id = props.id ?? props.name;
  return (
    <div className="mb-3">
      <InputLabel htmlFor={id}>{props.label}</InputLabel>
      <input
        id={id}
        ref={ref}
        className={`${props.className ?? ''}`}
        type="date"
        placeholder={props.placeholder}
        {...oProps}
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

export { DateInput };
