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
  let defaultTextSize = '';
  switch (HeadingComponent) {
    case 'h1':
      defaultTextSize = ' text-6xl pt-16 pb-6';
      break;
    case 'h2':
      defaultTextSize = ' text-3xl pt-16 pb-3';
      break;
    case 'h3':
      defaultTextSize = ' text-2xl pt-12 pb-6';
      break;
    case 'h4':
      defaultTextSize = ' text-xl pt-3 pb-1';
      break;
    case 'h5':
      defaultTextSize = ' text-base pt-2 pb-1';
      break;
    case 'h6':
      defaultTextSize = ' text-base pt-1 pb-1';
      break;
    default:
      break;
  }

  // Adjust padding based on heading level
  let defaultSpacing = 'pt-6 pb-3';
  switch (HeadingComponent) {
    case 'h1':
      defaultSpacing = ' pt-16 pb-6';
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

  const baseClassName = props.className ?? defaultTextSize;
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
