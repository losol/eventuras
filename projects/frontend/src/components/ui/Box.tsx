import { ReactNode } from 'react';

/**
 * BoxOptions interface for defining default padding and margin.
 */
interface BoxOptions {
  defaultPadding?: string;
  defaultMargin?: string;
}

/**
 * BoxProps interface for specifying padding, margin, and gap properties.
 */
export interface BoxProps {
  padding?: string;
  margin?: string;
  gap?: string;
}

/**
 * BoxComponentProps extends BoxProps with additional properties for component customization.
 */
interface BoxComponentProps extends BoxProps {
  as?: keyof JSX.IntrinsicElements;
  options?: BoxOptions;
  children?: ReactNode;
  className?: string;
}

/**
 * Generates a string of spacing-related class names based on provided BoxProps and BoxOptions.
 * @param {BoxProps} boxProps - The Box properties.
 * @param {BoxOptions} [options={}] - Optional BoxOptions for default values.
 * @returns {string} - A string of class names for spacing.
 */
export function spacingClassName(boxProps: BoxProps, options: BoxOptions = {}): string {
  const classes = [];

  if (!boxProps.padding && options.defaultPadding) {
    classes.push(options.defaultPadding);
  }

  if (!boxProps.margin && options.defaultMargin) {
    classes.push(options.defaultMargin);
  }

  if (boxProps.gap) {
    classes.push(boxProps.gap);
  }

  return classes.join(' ');
}

/**
 * Box component for consistent application of padding, margin, and gap styles.
 * @param {BoxComponentProps} props - The Box component properties.
 * @returns {JSX.Element} - The rendered Box component.
 */
export const Box: React.FC<BoxComponentProps> = ({
  as: Component = 'div',
  className,
  options,
  ...props
}) => {
  className = className
    ? `${className} ${spacingClassName(props, options)}`
    : spacingClassName(props, options);
  return <Component className={className} {...props} />;
};
