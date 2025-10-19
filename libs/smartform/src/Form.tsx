'use client';

import { type FC, type ReactNode } from 'react';
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form';

interface FormProps extends UseFormProps {
  children: ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  testId?: string;
}

const defaultFormClassName = 'px-8 pt-6 pb-8 mb-4';

const Form: FC<FormProps> = ({ children, onSubmit, className, testId, ...formOptions }) => {
  const methods = useForm(formOptions);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className ?? defaultFormClassName}
        data-testid={testId}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;
