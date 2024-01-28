import React, { ReactNode } from 'react';

interface FieldsetProps {
  label?: string;
  className?: string;
  legendClassName?: string;
  children: ReactNode;
  disabled?: boolean;
}

export const styles = {
  fieldsetClassName: 'text-lg pt-3 pb-6',
  legendClassName: 'text-lg border-b-2 pt-4 pb-2',
};

const Fieldset: React.FC<FieldsetProps> = props => (
  <fieldset disabled={props.disabled} className={props.className ?? styles.fieldsetClassName}>
    {props.label && (
      <legend className={props.legendClassName ?? styles.legendClassName}>{props.label}</legend>
    )}
    {props.children}
  </fieldset>
);

export default Fieldset;
