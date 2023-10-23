/**
 * This is a placeholder editor which may be replaced by something like lexical in the near future
 * @returns <textarea />

 */

import { compiler } from 'markdown-to-jsx';
import { useRef, useState } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';

import Button from '../ui/Button';

export type MarkdownEditorProps = {
  form: UseFormReturn<any>;
  defaultValue?: string;
  options?: RegisterOptions;
  formName: string;
  placeholder?: string;
  className?: string;
  label?: string;
};

const MarkdownEditor = ({
  form,
  options,
  className,
  placeholder,
  label,
  formName,
  defaultValue,
}: MarkdownEditorProps) => {
  const {
    register,
    formState: { errors },
  } = form;

  const reg = register(formName, options);
  const id = formName;
  const [editing, setEditing] = useState<boolean>(false);
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
        <textarea
          {...reg}
          id={id}
          className={inFullMode ? editorClassNameFull : editorClassName}
          placeholder={placeholder}
          onChange={e => {
            if (reg.onChange) {
              reg.onChange(e);
              toCompile.current = e.target.value;
            }
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
        <Button onClick={onEdit}>{editing ? 'View' : 'Edit'}</Button>
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

MarkdownEditor.displayName = 'markdowneditor';
export default MarkdownEditor;
