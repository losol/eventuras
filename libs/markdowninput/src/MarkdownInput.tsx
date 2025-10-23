'use client';
import MarkdownEditor from '@eventuras/scribo';
import '@eventuras/scribo/style.css';
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
 * MarkdownInput component that works with native forms (FormData API)
 * No longer requires react-hook-form
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
    <div className={styles.wrapper}>
      {props.label && <label htmlFor={id}>{props.label}</label>}
      {/* Hidden input to submit markdown value with the form */}
      <input type="hidden" name={props.name} value={value} />
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
