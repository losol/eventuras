'use client';
import MarkdownEditor from '@eventuras/scribo';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export type MarkdownInputProps = {
  id?: string;
  name: string;
  maxLength?: number;
  label?: string;
  placeholder?: string;
};

const styles = {
  wrapper: 'mb-3 bg-white text-black',
  editor: 'w-full',
};

const MarkdownInput = (props: MarkdownInputProps) => {
  const { control } = useFormContext();
  const toCompile = useRef('');
  const plain = useRef('');
  const id = props.id ?? props.name;
  return (
    <div className={styles.wrapper}>
      {props.label && <label htmlFor={id}>{props.label}</label>}
      <Controller
        control={control}
        name={props.name}
        shouldUnregister={false}
        rules={{
          validate: (): boolean => {
            if (!props.maxLength) return true;
            return plain.current.length < props.maxLength;
          },
        }}
        render={({ field: { onChange, onBlur, value }, formState: { errors } }) => {
          return (
            <>
              <MarkdownEditor
                onChange={(markdown, { plainText }) => {
                  onChange(markdown);
                  toCompile.current = markdown;
                  plain.current = plainText;
                }}
                className={styles.editor}
                onBlur={onBlur}
                initialMarkdown={value}
                placeholder={props.placeholder}
              />
              {errors[props.name] && (
                <span role="alert" className="text-red-500 bg-black">
                  Please provide a maximum of 300 characters{' '}
                </span>
              )}
            </>
          );
        }}
      />
    </div>
  );
};

MarkdownInput.displayName = 'MarkdownInput';
export default MarkdownInput;
