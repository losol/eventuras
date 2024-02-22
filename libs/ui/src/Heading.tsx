export type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
  spacingClassName?: string;
  bgDark?: boolean;
};

const Heading = (props: HeadingProps) => {
  const HeadingComponent = props.as ?? 'h1';
  const bgDark = props.bgDark ?? false;

  // Adjust font size based on heading level
  let textSize = 'text-base';
  switch (HeadingComponent) {
    case 'h1':
      textSize = 'text-6xl';
      break;
    case 'h2':
      textSize = 'text-3xl';
      break;
    case 'h3':
      textSize = 'text-2xl';
      break;
    case 'h4':
      textSize = 'text-xl';
      break;
    default:
      break;
  }

  // Adjust padding based on heading level
  let defaultSpacing = 'pt-6 pb-3';
  switch (HeadingComponent) {
    case 'h1':
      defaultSpacing = 'pt-16 pb-6';
      break;
    case 'h2':
      defaultSpacing = 'pt-12 pb-3';
      break;
    case 'h3':
      defaultSpacing = 'pt-12 pb-6';
      break;
    default:
      break;
  }

  const baseClassName = props.className ?? textSize;
  const textColor = bgDark ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';
  const spacing = props.spacingClassName ?? defaultSpacing;
  const headingClassName = `${baseClassName} ${spacing} ${textColor}`;

  return (
    <>
      <HeadingComponent className={headingClassName}>{props.children}</HeadingComponent>
    </>
  );
};

export default Heading;
