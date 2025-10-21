import { FC, ReactNode } from 'react';
import { DATA_TEST_ID } from '@eventuras/utils';

interface FormProps  {
  action?: any;
  children: ReactNode;
  onSubmit?: (data: any) => void;
  className?: string;
  [DATA_TEST_ID]?: string;
}

const defaultFormClassName = 'pt-6 pb-8 mb-4';

export const Form: FC<FormProps> = (props) => {

  return (
    <form
        action={props.action}
        onSubmit={props.onSubmit}
        className={props.className ?? defaultFormClassName}
        {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}
      >
        {props.children}
      </form>
  );
};
