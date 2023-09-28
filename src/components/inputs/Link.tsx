import NextLink from 'next/link';

interface BlockLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  lightText?: boolean;
}

const BlockLink = (props: BlockLinkProps) => {
  const defaultClasses =
    'bg-primary-400 dark:bg-sky-950 hover:bg-sky-700 font-bold my-6 py-4 px-4 block';
  const textColor = props.lightText ? 'text-white' : 'text-black';
  const classes = props.className ? props.className : `${defaultClasses} ${textColor}`;

  return (
    <NextLink href={props.href} className={classes}>
      {props.children}
    </NextLink>
  );
};

export { BlockLink };
