export type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
};

const Heading = (props: HeadingProps) => {
  const HeadingComponent = props.as ?? 'h1';

  // Define default Tailwind CSS classes for font size and padding
  let defaultClasses = '';

  // Adjust font size and padding based on heading level
  if (props.className === undefined || props.className === null) {
    switch (HeadingComponent) {
      case 'h1':
        defaultClasses = ' text-6xl pt-16 pb-6';
        break;
      case 'h2':
        defaultClasses = ' text-3xl pt-16 pb-3';
        break;
      case 'h3':
        defaultClasses = ' text-2xl pt-12 pb-6';
        break;
      case 'h4':
        defaultClasses = ' text-xl pt-3 pb-1';
        break;
      case 'h5':
        defaultClasses = ' text-base pt-2 pb-1';
        break;
      case 'h6':
        defaultClasses = ' text-base pt-1 pb-1';
        break;
      default:
        break;
    }
  }

  return (
    <>
      <HeadingComponent className={props.className ?? defaultClasses}>
        {props.children}
      </HeadingComponent>
    </>
  );
};

export default Heading;
