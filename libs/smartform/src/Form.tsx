'use client';

import { FC, ReactNode } from 'react';
import { FormProvider, useForm, UseFormProps } from 'react-hook-form';
import { DATA_TEST_ID } from '@eventuras/utils';

interface FormProps extends UseFormProps {
  children: ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  [DATA_TEST_ID]?: string;
}

const defaultFormClassName = 'px-8 pt-6 pb-8 mb-4';

const Form: FC<FormProps> = (props) => {
  const methods = useForm({ defaultValues: props.defaultValues });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(props.onSubmit)}
        className={props.className ?? defaultFormClassName}
        {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}
      >
        {props.children}
      </form>
    </FormProvider>
  );
};

export default Form;
