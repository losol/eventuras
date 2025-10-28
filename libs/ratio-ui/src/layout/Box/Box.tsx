import React, { ReactNode, ElementType, CSSProperties } from 'react';

export interface BoxSpacingProps {
  padding?: string;      // e.g. 'px-4 py-2'
  margin?: string;       // e.g. 'm-1'
  border?: string;       // e.g. 'border border-gray-200'
  width?: string;        // e.g. 'w-full'
  height?: string;       // e.g. 'h-64'
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8'; // Tailwind spacing scale for flex/grid gap
}

export interface BoxContentProps {
  as?: ElementType;      // e.g. 'div' | 'section' | 'button'
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface BoxBackgroundProps {
  backgroundColorClass?: string; // e.g. 'bg-white dark:bg-gray-800'
  backgroundImageUrl?: string; // e.g. '/foo.jpg'
}

export type BoxProps =
  & BoxSpacingProps
  & BoxContentProps
  & BoxBackgroundProps;

/** Helper to build the spacing/size/border classes */
export function buildSpacingClasses({
  padding,
  margin,
  border,
  width,
  height,
  gap,
}: BoxSpacingProps) {
  const gapClass = gap ? `gap-${gap}` : undefined;
  
  return [
    padding,
    margin,
    border,
    width,
    height,
    gapClass,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Build the inline style object for a background image,
 * merging in any existing `style` passed by the consumer.
 */
export function getBackgroundStyle(
  backgroundImage?: string,
  existingStyle?: CSSProperties,
  backgroundImageOverlay: boolean = true
): CSSProperties | undefined {
  if (!backgroundImage) return existingStyle;

  const imageValue = backgroundImageOverlay
    ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url(${backgroundImage})`
    : `url(${backgroundImage})`;

  return {
    backgroundImage:    imageValue,
    backgroundSize:     'cover',
    backgroundPosition: 'center',
    ...existingStyle,
  };
}

export const Box: React.FC<BoxProps> = ({
  as: Component = 'div',
  padding, margin, border, width, height, gap,
  backgroundColorClass, backgroundImageUrl,
  id, className = '', style, children,
  ...rest
}) => {
  const spacingClasses = buildSpacingClasses({ padding, margin, border, width, height, gap });

  const bgStyle = backgroundImageUrl
    ? {
        backgroundImage:    `url(${backgroundImageUrl})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        ...style,
      }
    : style;

  const finalClassName = [
    spacingClasses,
    backgroundColorClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      id={id}
      className={finalClassName}
      style={bgStyle}
      {...rest}
    >
      {children}
    </Component>
  );
};

Box.displayName = 'Box';
