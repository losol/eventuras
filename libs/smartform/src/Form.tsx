'use client';

import { FC, ReactNode } from 'react';
import { FormProvider, useForm, UseFormProps } from 'react-hook-form';

interface FormProps extends UseFormProps {
  children: ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  testId?: string;
}

const defaultFormClassName = 'px-8 pt-6 pb-8 mb-4';

const Form: FC<FormProps> = (props) => {
  const methods = useForm({ defaultValues: props.defaultValues });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(props.onSubmit)}
        className={props.className ?? defaultFormClassName}
        data-testid={props.testId}
      >
        {props.children}
      </form>
    </FormProvider>
  );
};

export default Form;
