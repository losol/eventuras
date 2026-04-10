import type { SpacingProps } from '../../tokens/spacing';
import { buildSpacingClasses } from '../../tokens/spacing';
import { cn } from '../../utils/cn';

export interface HeadingProps extends SpacingProps {
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
  className,
  onDark = false,
  ...spacingProps
}: HeadingProps) => {
  const textColor = onDark ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';

  return (
    <HeadingComponent className={cn(textColor, buildSpacingClasses(spacingProps), className)}>
      {children}
    </HeadingComponent>
  );
};

export default Heading;
