'use client';
/**
 * This is a markdown editor
 * @returns <textarea />

 */

import MarkdownEditor from '@eventuras/scribo';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export type MarkdownInputProps = {
  id?: string;
  name: string;
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

  return (
    <div className={styles.wrapper}>
      {props.label && <label htmlFor={props.id}>{props.label}</label>}
      <Controller
        control={control}
        name={props.name}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <MarkdownEditor
              onChange={markdown => {
                onChange(markdown);
                toCompile.current = markdown;
              }}
              className={styles.editor}
              onBlur={onBlur}
              initialMarkdown={value}
              placeholder={props.placeholder}
            />
          );
        }}
      />
    </div>
  );
};

MarkdownInput.displayName = 'MarkdownEditView';
export default MarkdownInput;
