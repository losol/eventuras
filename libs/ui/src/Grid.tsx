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
  const containerClass = container ? 'container ' : '';
  const additionalClasses = paddingClassName || '';

  return wrapperClassName ? (
    <div className={wrapperClassName}>
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-2 ${containerClass} ${additionalClasses}`}>{children}</div>
    </div>
  ) : (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-2   ${containerClass} ${additionalClasses}`}>{children}</div>
  );
};

export default Grid;
