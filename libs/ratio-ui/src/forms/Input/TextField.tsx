import React, {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { InputFieldProps } from './InputProps';
import { formStyles } from '../styles/formStyles';
import { Label } from '../common/Label';
import { InputError } from '../common/InputError';
import { InputDescription } from '../common/InputDescription';

interface ExtendedInputProps extends InputFieldProps {
  multiline?: boolean;
  rows?: number;
  cols?: number;
}

type CommonProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    'aria-invalid'?: boolean;
    'data-testid'?: string;
    [key: string]: any;
  };

/**
 * TextField component - A complete form field with label, input, description, and error.
 *
 * This is a composite component that includes:
 * - Label (optional)
 * - Input Description (optional)
 * - Input or Textarea element
 * - Error messages (optional)
 *
 * For a simpler, composable input element, see the `Input` component.
 *
 * @example
 * ```tsx
 * <TextField
 *   name="email"
 *   type="email"
 *   label="Email Address"
 *   placeholder="Enter your email"
 *   description="We'll never share your email"
 *   errors={formErrors}
 * />
 * ```
 */
export const TextField = forwardRef<HTMLElement, ExtendedInputProps>(
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
      noMargin = false,
      noWrapper = false,
      testId,
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
      'data-testid': testId,
      name,
      ...rest,
    };

    const inputElement = multiline ? (
      <textarea
        ref={assignRef as React.Ref<HTMLTextAreaElement>}
        rows={rows ?? 3}
        {...commonProps}
      />
    ) : (
      <input
        ref={assignRef as React.Ref<HTMLInputElement>}
        type={type}
        {...commonProps}
      />
    );

    const content = (
      <>
        {label && <Label htmlFor={id}>{label}</Label>}
        {description && <InputDescription>{description}</InputDescription>}
        {inputElement}
        {hasError && <InputError errors={errors} name={name} />}
      </>
    );

    if (noWrapper) {
      return content;
    }

    return <div className={formStyles.inputWrapper}>{content}</div>;
  }
);

TextField.displayName = 'TextField';
