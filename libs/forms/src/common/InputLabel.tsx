import React from 'react';

type LabelProps = {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

const styles = {
  label: 'block font-bold mb-2',
};

/**
 * Renders a label element with optional custom styling.
 *
 * Designed to be used in conjunction with input elements, it provides an accessible
 * and stylized way to label forms. If no children are provided, the component renders
 * `null` to avoid rendering an empty label element.
 *
 * @param {LabelProps} props - The properties passed to the label component.
 * @returns {React.ReactElement | null} The Label component or null if no children are provided.
 */
const InputLabel: React.FC<LabelProps> = ({ children, className, htmlFor }) => {
  if (!children) return null;

  return (
    <label htmlFor={htmlFor} className={className ?? styles.label}>
      {children}
    </label>
  );
};

export { InputLabel};
