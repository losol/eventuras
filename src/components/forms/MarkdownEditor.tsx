/**
 * This is a placeholder editor which may be replaced by something like lexical in the near future
 * @returns <textarea />

 */

import React from 'react';

export type MarkdownEditorProps = {
  [x: string]: any;
};

/**
 * TODO this follows pretty much the same pattern as Input, if this component does not diverge from those components,
 * then we can consider making it a higher order component for reusabilities sake.
 */

const MarkdownEditor = React.forwardRef<HTMLTextAreaElement, MarkdownEditorProps>((props, ref) => {
  const oProps = { ...props };
  delete oProps.children;
  delete oProps.type;
  delete oProps.className;
  const id = props.id ?? props.name;
  return (
    <div className="mb-3">
      {props.label && <label htmlFor={id}>{props.label}</label>}
      <textarea
        id={id}
        ref={ref}
        className={`${props.className ?? ''}`}
        placeholder={props.placeholder}
        {...oProps}
      />
      {props.errors && (
        <label htmlFor={id} role="alert" className="text-red-500">
          {props.errors[props.name]?.message}
        </label>
      )}
    </div>
  );
});

MarkdownEditor.displayName = 'markdowneditor';
export default MarkdownEditor;
