import NextLink from 'next/link';

import { buttonStyles } from './Button';

interface LinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?:
    | 'button-primary'
    | 'button-secondary'
    | 'button-light'
    | 'button-outline'
    | 'button-transparent';
  block?: boolean;
  bgDark?: boolean;
  stretch?: boolean;
}

const Link: React.FC<LinkProps> = ({
  href,
  children,
  className,
  bgDark = false,
  block = false,
  variant,
  stretch,
}) => {
  // Text color
  const textColor =
    bgDark || variant == 'button-primary' ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200';

  // Block classes
  const blockClasses = block ? 'block' : '';

  // Choose appropriate variant classes
  let variantClasses = '';
  if (variant?.startsWith('button-')) {
    const buttonVariant = variant.replace('button-', '');
    if (buttonStyles.hasOwnProperty(buttonVariant)) {
      variantClasses = buttonStyles[buttonVariant as keyof typeof buttonStyles];
    }
  }

  // Combine all classes
  const classes = [
    buttonStyles.basePadding,
    buttonStyles.baseMargin,
    variantClasses,
    textColor,
    blockClasses,
    className,
    stretch ? 'stretched-link' : '',
  ].join(' ');

  return (
    <NextLink className={classes} href={href}>
      {children}
    </NextLink>
  );
};

export default Link;
