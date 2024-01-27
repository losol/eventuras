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

const Grid: React.FC<GridProps> = ({ paddingClassName, wrapperClassName, container, children }) => {
  const baseClasses = 'grid gap-4';
  const colClasses = `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
  const containerClass = container ? 'container' : '';
  const additionalClasses = paddingClassName || '';

  const gridClassNames = [baseClasses, colClasses, containerClass, additionalClasses]
    .join(' ')
    .trim();

  return wrapperClassName ? (
    <div className={wrapperClassName}>
      <div className={gridClassNames}>{children}</div>
    </div>
  ) : (
    <div className={gridClassNames}>{children}</div>
  );
};

export default Grid;
