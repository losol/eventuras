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

const Grid: React.FC<GridProps> = ({
  cols = { sm: 1, md: 2, lg: 3 },
  paddingClassName,
  wrapperClassName,
  container,
  children,
}) => {
  const { sm, md, lg } = cols;
  const gridClassNames = `grid grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} gap-4 ${
    paddingClassName || ''
  } ${container ? 'container' : ''}`;

  return wrapperClassName ? (
    <div className={wrapperClassName}>
      <div className={gridClassNames}>{children}</div>
    </div>
  ) : (
    <div className={gridClassNames}>{children}</div>
  );
};

export default Grid;
