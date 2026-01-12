import React from 'react';

interface GridProps {
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  paddingClassName?: string;
  wrapperClassName?: string;
  container?: boolean;
  children: React.ReactNode;
}

const getGridCols = (cols?: GridProps['cols']) => {
  if (!cols) return '';
  return [
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
  ].join(' ');
};

const Grid: React.FC<GridProps> = ({
  cols = { md: 2, lg: 3 },
  paddingClassName,
  wrapperClassName,
  container,
  children
}) => {
  const containerClass = container ? 'container' : '';
  const additionalClasses = paddingClassName || '';
  const gridCols = getGridCols(cols);

  const content = (
    <div className={`grid ${gridCols} gap-4 ${containerClass} ${additionalClasses}`}>
      {children}
    </div>
  );

  return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content;
};

export default Grid;
