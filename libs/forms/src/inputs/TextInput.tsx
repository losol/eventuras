/**
 * Basic text input field
 * requires ref forwarding because it is used by react hooks
 * @see https://stackoverflow.com/questions/67877887/react-hook-form-v7-function-components-cannot-be-given-refs-attempts-to-access
 */
import React from "react";
import { InputProps } from "./InputProps";
import { formStyles } from "../styles/formStyles";
import { InputLabel } from "../common/InputLabel";
import ErrorLabel from "../common/ErrorLabel";

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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
        className={`${props.className ?? formStyles.defaultInputStyle}`}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        {...oProps}
      />
      <ErrorLabel errors={props.errors} name={props.name} />
    </div>
  );
});

TextInput.displayName = 'TextInput';
