'use client';
/**
Need to merge this with MarkdownInput
 */

import MarkdownEditor from '@eventuras/scribo';
import Button from '@eventuras/ui/Button';
import { compiler } from 'markdown-to-jsx';
import { useRef, useState } from 'react';
import { Controller, RegisterOptions, UseFormReturn } from 'react-hook-form';

export type MarkdownEditViewProps = {
  form: UseFormReturn<any>;
  defaultValue?: string;
  options?: RegisterOptions;
  formName: string;
  placeholder?: string;
  className?: string;
  label?: string;
  editmodeOnly?: boolean;
  minLength?: number;

};

const MarkdownEditView = ({
  form,
  className,
  placeholder,
  label,
  formName,
  defaultValue,
  editmodeOnly,
  minLength
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
  const plain = useRef('');


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
          rules={{
            validate: (): boolean => {
              if (minLength === undefined) return true;
              return plain.current.length >= minLength;
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => {
            return (
              <>
                <MarkdownEditor
                  onChange={(markdown, { plainText }) => {
                    onChange(markdown);
                    toCompile.current = markdown;
                    plain.current = plainText;
                  }}
                  className={inFullMode ? editorClassNameFull : editorClassName}
                  onBlur={onBlur}
                  initialMarkdown={value}
                  placeholder={placeholder}
                />
                {errors[formName] && (
                  <span role="alert" className="text-red-500 bg-black">
                    {`Please provide a minimum of ${minLength} characters `}
                  </span>
                )}
              </>
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
