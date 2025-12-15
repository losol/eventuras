'use client';

import { type ReactNode, useEffect } from 'react';
import { FormProvider, useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';

interface FormProps<T extends Record<string, unknown> = Record<string, unknown>> extends UseFormProps<T> {
  children: ReactNode;
  onSubmit: (data: T) => void;
  className?: string;
  testId?: string;
  /** Callback to receive form methods for external use */
  onFormReady?: (methods: UseFormReturn<T>) => void;
}

const defaultFormClassName = 'pt-6 pb-8 mb-4';

function Form<T extends Record<string, unknown> = Record<string, unknown>>({
  children,
  onSubmit,
  className,
  testId,
  onFormReady,
  ...formOptions
}: FormProps<T>) {
  const methods = useForm<T>(formOptions);

  // Expose methods to parent if callback provided
  useEffect(() => {
    if (onFormReady) {
      onFormReady(methods);
    }
  }, [methods, onFormReady]);

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
}

export default Form;
