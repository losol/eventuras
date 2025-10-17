import { FC, ReactNode } from 'react';

interface FormProps  {
  action?: any;
  children: ReactNode;
  onSubmit?: (data: any) => void;
  className?: string;
  testId?: string;
}

const defaultFormClassName = 'pt-6 pb-8 mb-4';

export const Form: FC<FormProps> = (props) => {

  return (
    <form
        action={props.action}
        onSubmit={props.onSubmit}
        className={props.className ?? defaultFormClassName}
        data-testid={props.testId}
      >
        {props.children}
      </form>
  );
};
