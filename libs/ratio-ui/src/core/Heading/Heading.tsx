import { BoxSpacingProps } from '../../layout/Box/Box';

export interface HeadingProps extends BoxSpacingProps  {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
  onDark?: boolean;
};

const Heading = (props: HeadingProps) => {
  const HeadingComponent = props.as ?? 'h1';
  const onDark = props.onDark ?? false;

  // Adjust font size based on heading level
  let textSize = 'text-base';
  switch (HeadingComponent) {
    case 'h1':
      textSize = 'text-6xl';
      break;
    case 'h2':
      textSize = 'text-4xl';
      break;
    case 'h3':
      textSize = 'text-2xl';
      break;
    default:
      textSize = 'text-base';
      break;
  }

  // Adjust padding based on heading level
  let defaultPadding = 'pt-6 pb-1';
  switch (HeadingComponent) {
    case 'h1':
      defaultPadding = 'pt-12 pb-1';
      break;
    case 'h2':
      defaultPadding = 'pt-9 pb-1';
      break;
    case 'h3':
      defaultPadding = 'pt-6 pb-1';
      break;
    default:
      break;
  }

  const baseClassName = props.className ?? textSize;
  const textColor = onDark ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';
  const spacing = props.padding ?? defaultPadding;
  const headingClassName = `${baseClassName} ${spacing} ${textColor}`;

  return (
    <>
      <HeadingComponent className={headingClassName}>{props.children}</HeadingComponent>
    </>
  );
};

export default Heading;
