'use client';
import MarkdownEditor from '@eventuras/scribo';
import { useRef, useState } from 'react';

export type MarkdownInputProps = {
  id?: string;
  name: string;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
};

const styles = {
  wrapper: 'mb-3 bg-white text-black',
  editor: 'w-full',
};

/**
 * MarkdownInput component that works with both react-hook-form and native forms
 * Uses an uncontrolled hidden input with ref for better compatibility
 */
const MarkdownInput = (props: MarkdownInputProps) => {
  const [error, setError] = useState<string | null>(null);
  const plainTextRef = useRef('');
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const id = props.id ?? props.name;

  const handleChange = (markdown: string, { plainText }: { plainText: string }) => {
    plainTextRef.current = plainText;

    // Update the hidden input's value directly via ref
    // This ensures FormData picks up the latest value
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = markdown;
    }

    // Validate maxLength if provided
    if (props.maxLength && plainText.length >= props.maxLength) {
      setError(`Maximum ${props.maxLength} characters allowed`);
    } else {
      setError(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      {props.label && <label htmlFor={id}>{props.label}</label>}
      {/* Hidden input with ref - value updated directly via DOM */}
      <input
        type="hidden"
        name={props.name}
        ref={hiddenInputRef}
        defaultValue={props.defaultValue ?? ''}
      />
      <MarkdownEditor
        onChange={handleChange}
        className={styles.editor}
        initialMarkdown={props.defaultValue}
        placeholder={props.placeholder}
      />
      {error && (
        <span role="alert" className="text-red-500 bg-black">
          {error}
        </span>
      )}
    </div>
  );
};

MarkdownInput.displayName = 'MarkdownInput';
export default MarkdownInput;
