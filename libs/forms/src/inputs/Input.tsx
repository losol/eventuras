import React, {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { InputProps } from './InputProps'; // Ensure this includes 'multiline', 'rows', 'cols'
import { formStyles } from '../styles/formStyles';
import { InputLabel } from '../common/InputLabel';
import { InputError } from '../common/InputError';
import { InputDescription } from '../common/InputDescription';
import { DATA_TEST_ID } from '@eventuras/utils';

interface ExtendedInputProps extends InputProps {
  multiline?: boolean;
  rows?: number;
  cols?: number;
}

type CommonProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    'aria-invalid'?: boolean;
    'data-test-id'?: string;
  };

export const Input = forwardRef<HTMLElement, ExtendedInputProps>(
  (
    {
      name,
      type = 'text',
      placeholder,
      label,
      description,
      className,
      errors,
      disabled,
      multiline = false,
      rows,
      cols,
      ...rest
    },
    forwardedRef
  ) => {
    const hasError = errors && errors[name];

    let inputClassName = `${className ?? formStyles.defaultInputStyle} ${
      hasError ? formStyles.inputErrorGlow : ''
    } ${disabled ? 'cursor-not-allowed' : ''}`;

    if (multiline) {
      inputClassName = `${inputClassName} ${formStyles.textarea}`;
    }

    const id = rest.id ?? name;

    const assignRef = (
      element: HTMLInputElement | HTMLTextAreaElement | null
    ) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef && 'current' in forwardedRef) {
        (forwardedRef as React.MutableRefObject<
          HTMLInputElement | HTMLTextAreaElement | null
        >).current = element;
      }
    };

    const commonProps: CommonProps = {
      id,
      className: inputClassName,
      placeholder,
      disabled,
      'aria-invalid': hasError ? true : undefined,
      name,
      ...rest,
    };

    if (multiline) {
      commonProps.rows = rows ?? 3;
      if (cols !== undefined) {
        commonProps.cols = cols;
      }
    }

    return (
      <div className={formStyles.inputWrapper}>
        {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        {multiline ? (
          <textarea
            ref={assignRef as React.Ref<HTMLTextAreaElement>}
            {...commonProps}
            {...{ [DATA_TEST_ID]: commonProps[DATA_TEST_ID] }}
          />
        ) : (
          <input
            ref={assignRef as React.Ref<HTMLInputElement>}
            type={type}
            {...commonProps}
          />
        )}
        {hasError && <InputError errors={errors} name={name} />}
      </div>
    );
  }
);

Input.displayName = 'TextInput';
