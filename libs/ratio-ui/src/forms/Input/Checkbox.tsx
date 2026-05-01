import React, { FC, InputHTMLAttributes, ReactNode } from 'react';

export const checkboxStyles = {
  container: 'my-2',
  checkbox:
    'align-text-bottom w-5 h-5 text-(--primary) bg-card border-border-1 focus:ring-(--focus-ring) focus:ring-2',
  label: 'font-bold ml-2 text-(--text)',
  description: 'ml-7 mt-2 text-sm',
};

interface CheckboxComponentProps {
  id: string;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  containerClassName?: string;
}

interface SubComponentProps {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export interface CheckboxProps
  extends CheckboxComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'children' | 'className'> {
  testId?: string;
  children?: ReactNode;
}

type CheckboxWithSubComponents = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CheckboxProps> & React.RefAttributes<HTMLInputElement>
> & {
  Label: FC<SubComponentProps>;
  Description: FC<SubComponentProps>;
};

export const CheckBoxLabel: FC<SubComponentProps> = ({ children, className, htmlFor }) => {
  const labelClassName = className || checkboxStyles.label;
  return (
    <label htmlFor={htmlFor} className={labelClassName}>
      {children}
    </label>
  );
};

export const CheckBoxDescription: FC<SubComponentProps> = ({ children, className }) => {
  const descriptionClassName = className || checkboxStyles.description;
  return <p className={descriptionClassName}>{children}</p>;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    className,
    containerClassName,
    children,
    id,
    disabled,
    defaultChecked,
    testId,
    ...rest
  } = props;

  const checkboxClassName = className || checkboxStyles.checkbox;
  const containerClass = containerClassName || checkboxStyles.container;

  // Add the htmlFor attribute to the label
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement<SubComponentProps>(child) && child.type === CheckBoxLabel) {
      return React.cloneElement(child, { htmlFor: id } as SubComponentProps);
    }
    return child;
  });

  return (
    <div key={id} className={containerClass}>
      <input
        type="checkbox"
        className={checkboxClassName}
        ref={ref}
        id={id}
        disabled={disabled}
        defaultChecked={defaultChecked}
        data-testid={testId}
        {...rest}
      />
      {enhancedChildren}
    </div>
  );
}) as CheckboxWithSubComponents;

Checkbox.displayName = 'Checkbox';
Checkbox.Label = CheckBoxLabel;
Checkbox.Description = CheckBoxDescription;

export { Checkbox };
