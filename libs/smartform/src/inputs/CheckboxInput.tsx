import React, { FC, InputHTMLAttributes, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';


export const styles = {
  container: 'my-2',
  checkbox:
    'align-text-bottom w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600',
  label: 'font-bold ml-2 text-gray-900 dark:text-gray-300',
  description: 'ml-7 mt-2 text-sm',
};

interface CheckboxComponentProps {
  id?: string;
  name: string;
  className?: string;
  disabled?: boolean;
  validation?: Record<string, unknown>;
}

interface SubComponentProps {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'>,
    CheckboxComponentProps {
  'data-test-id'?: string;
}

type CheckboxWithSubComponents = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CheckboxProps> & React.RefAttributes<HTMLInputElement>
> & {
  Label: FC<SubComponentProps>;
  Description: FC<SubComponentProps>;
};

export const CheckboxLabel: FC<SubComponentProps> = ({ children, className, htmlFor }) => {
  const labelClassName = className || styles.label;
  return (
    <label htmlFor={htmlFor} className={labelClassName}>
      {children}
    </label>
  );
};

export const CheckboxDescription: FC<SubComponentProps> = ({ children, className }) => {
  const descriptionClassName = className || styles.description;
  return <p className={descriptionClassName}>{children}</p>;
};

const CheckboxInput = React.forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const { children, id, disabled, defaultChecked, name, validation, className } = props;

  const formContext = useFormContext();

  // Guard against missing form context
  if (!formContext) {
    return null;
  }

  const { register } = formContext;

  // Add the htmlFor attribute to the label
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement<SubComponentProps>(child) && child.type === CheckboxLabel) {
      return React.cloneElement(child, { htmlFor: id } as SubComponentProps);
    }
    return child;
  });

  return (
    <div key={id} className={styles.container}>
      <input
        type="checkbox"
        className={className || styles.checkbox}
        id={id}
        disabled={disabled}
        defaultChecked={defaultChecked}
        data-testid={props['data-test-id']}
        {...register(name, validation)}
        ref={e => {
          // Assign the ref from forwardRef
          if (typeof ref === 'function') {
            ref(e);
          } else if (ref) {
            ref.current = e;
          }

          // Also call the register function
          register(name, validation).ref(e);
        }}
      />
      {enhancedChildren}
    </div>
  );
}) as CheckboxWithSubComponents;

CheckboxInput.displayName = 'Checkbox';
CheckboxInput.Label = CheckboxLabel;
CheckboxInput.Description = CheckboxDescription;

export default CheckboxInput;
