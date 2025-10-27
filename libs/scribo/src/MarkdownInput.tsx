'use client';
import MarkdownEditor from './MarkdownEditor';
import { useRef, useState } from 'react';

export type MarkdownInputProps = {
  id?: string;
  name: string;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  labelClassName?: string;
  editorClassName?: string;
  errorClassName?: string;
  onChange?: (value: string) => void;
  'data-testid'?: string;
};

/**
 * MarkdownInput component that works standalone or with parent form handling
 * Uses onChange callback to notify parent of value changes
 * Framework-agnostic with flexible className props for custom styling
 */
const MarkdownInput = (props: MarkdownInputProps) => {
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(props.defaultValue ?? '');
  const plainTextRef = useRef('');
  const id = props.id ?? props.name;

  const handleChange = (markdown: string, { plainText }: { plainText: string; }) => {
    plainTextRef.current = plainText;
    setValue(markdown);

    // Notify parent component of the change
    if (props.onChange) {
      props.onChange(markdown);
    }

    // Validate maxLength if provided
    if (props.maxLength && plainText.length >= props.maxLength) {
      setError(`Maximum ${props.maxLength} characters allowed`);
    } else {
      setError(null);
    }
  };

  return (
    <div className={props.className}>
      {props.label && (
        <label htmlFor={id} className={props.labelClassName}>
          {props.label}
        </label>
      )}
      {/* Hidden input to store value - controlled by React state */}
      <input
        type="hidden"
        name={props.name}
        value={value}
      />
      <MarkdownEditor
        onChange={handleChange}
        className={props.editorClassName}
        initialMarkdown={props.defaultValue}
        placeholder={props.placeholder}
        data-testid={props['data-testid']}
        id={id}
      />
      {error && (
        <span role="alert" className={props.errorClassName}>
          {error}
        </span>
      )}
    </div>
  );
};

MarkdownInput.displayName = 'MarkdownInput';
export default MarkdownInput;
