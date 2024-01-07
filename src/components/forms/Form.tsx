'use client';

import React, { FC, ReactNode } from 'react';
import { FormProvider, useForm, UseFormProps } from 'react-hook-form';

interface FormProps extends UseFormProps {
  children: ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
}

const defaultFormClassName = 'px-8 pt-6 pb-8 mb-4';

const Form: FC<FormProps> = ({ defaultValues, children, onSubmit, className }) => {
  const methods = useForm({ defaultValues: defaultValues });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className ?? defaultFormClassName}>
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;
