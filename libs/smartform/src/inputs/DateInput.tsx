import React from 'react';
import { useFormContext } from 'react-hook-form';

import { DateInput as CoreDateInput, InputProps } from '@eventuras/forms';

const DateInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { register } = useFormContext();
  const { name, validation } = props;

  // Extend core input props with ref assignment and validation
  const inputProps = {
    ...props,
    ref: (e: HTMLInputElement) => {
      // Assign the ref from forwardRef
      if (typeof ref === 'function') {
        ref(e);
      } else if (ref) {
        ref.current = e;
      }

      // Also call the register function's ref assignment to add validation
      register(name, validation).ref(e);
    },
  };

  return <CoreDateInput {...inputProps} />;
});

DateInput.displayName = 'DateInput';

export { DateInput };
