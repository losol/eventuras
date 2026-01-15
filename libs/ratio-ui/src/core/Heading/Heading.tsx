import { BoxSpacingProps, buildSpacingClasses } from '../../layout/Box/Box';

export interface HeadingProps extends BoxSpacingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
  onDark?: boolean;
}

/**
 * Semantic heading component
 * Styling comes from CSS tokens in typography.css
 * Use className or spacing props to customize
 */
const Heading = ({
  as: HeadingComponent = 'h1',
  children,
  className = '',
  onDark = false,
  padding,
  margin,
  border,
  width,
  height,
}: HeadingProps) => {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height });
  const textColor = onDark ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';
  const headingClassName = [spacingClasses, textColor, className].filter(Boolean).join(' ');

  return <HeadingComponent className={headingClassName}>{children}</HeadingComponent>;
};

export default Heading;
