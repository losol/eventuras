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
};

/**
 * MarkdownInput component that works with native forms (FormData API)
 * Framework-agnostic with flexible className props for custom styling
 */
const MarkdownInput = (props: MarkdownInputProps) => {
  const [value, setValue] = useState(props.defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const plainTextRef = useRef('');
  const id = props.id ?? props.name;

  const handleChange = (markdown: string, { plainText }: { plainText: string }) => {
    setValue(markdown);
    plainTextRef.current = plainText;

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
      {/* Hidden input to submit markdown value with the form */}
      <input type="hidden" name={props.name} value={value} />
      <MarkdownEditor
        onChange={handleChange}
        className={props.editorClassName}
        initialMarkdown={props.defaultValue}
        placeholder={props.placeholder}
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
