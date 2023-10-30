/**
 * This is a placeholder editor which may be replaced by something like lexical in the near future
 * @returns <textarea />

 */

import MarkdownEditor from '@losol/scribo-markdown';
import { compiler } from 'markdown-to-jsx';
import { useRef, useState } from 'react';
import { Controller, RegisterOptions, UseFormReturn } from 'react-hook-form';

import Button from '../ui/Button';

export type MarkdownEditViewProps = {
  form: UseFormReturn<any>;
  defaultValue?: string;
  options?: RegisterOptions;
  formName: string;
  placeholder?: string;
  className?: string;
  label?: string;
  editmodeOnly?: boolean;
};

const MarkdownEditView = ({
  form,
  className,
  placeholder,
  label,
  formName,
  defaultValue,
  editmodeOnly,
}: MarkdownEditViewProps) => {
  const {
    formState: { errors },
    control,
  } = form;

  const id = formName;
  const [editing, setEditing] = useState<boolean>(editmodeOnly === true);
  const [inFullMode, setFullMode] = useState<boolean>(false);
  const toCompile = useRef(defaultValue ?? '');
  const onEdit = (e: any) => {
    setEditing(!editing);
    e.preventDefault();
  };

  const poppedInClass = 'mb-3 bg-white text-black';
  const poppedOutClass = `${poppedInClass} modal fixed w-full h-full top-0 left-0 flex items-center justify-center flex-col z-50`;

  const editorClassName = className ?? '';
  const editorClassNameFull = `${editorClassName} w-full h-full`;

  const viewerClassname = 'block';
  const viewerClassnameFull = `${viewerClassname} w-full h-full overflow-y-scroll`;

  if (inFullMode) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'initial';
  }
  return (
    <div className={inFullMode ? poppedOutClass : poppedInClass}>
      {label && <label htmlFor={id}>{label}</label>}
      {editing ? (
        <Controller
          control={control}
          name={formName}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => {
            return (
              <MarkdownEditor
                onChange={markdown => {
                  onChange(markdown);
                  toCompile.current = markdown;
                }}
                className={inFullMode ? editorClassNameFull : editorClassName}
                onBlur={onBlur}
                initialMarkdown={value}
                placeholder={placeholder}
              />
            );
          }}
        />
      ) : (
        <div className={inFullMode ? viewerClassnameFull : viewerClassname}>
          {compiler(toCompile.current ?? '')}
        </div>
      )}

      {errors && (
        <label htmlFor={id} role="alert" className="text-red-500">
          {errors[formName]?.message?.toString()}
        </label>
      )}
      <div className="block w-full">
        {editmodeOnly !== true && <Button onClick={onEdit}>{editing ? 'View' : 'Edit'}</Button>}
        <Button
          onClick={e => {
            setFullMode(!inFullMode);
            e.preventDefault();
          }}
        >
          {inFullMode ? 'Pop In' : 'Pop Out'}
        </Button>
      </div>
    </div>
  );
};

MarkdownEditView.displayName = 'MarkdownEditView';
export default MarkdownEditView;
