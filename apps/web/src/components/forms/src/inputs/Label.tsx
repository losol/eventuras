import React from 'react';

type LabelProps = {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

const styles = {
  label: 'block font-bold mb-2',
};

const Label: React.FC<LabelProps> = props => {
  if (!props.children) return null;

  return (
    <label htmlFor={props.htmlFor} className={props.className ?? styles.label}>
      {props.children}
    </label>
  );
};

export default Label;
