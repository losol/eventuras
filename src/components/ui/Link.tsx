import NextLink from 'next/link';

import { buttonStyles } from './Button';

interface LinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  lightText?: boolean;
  variant?: 'button-primary' | 'button-secondary' | 'button-light' | 'button-transparent';
  block?: boolean;
}

const Link: React.FC<LinkProps> = ({
  href,
  children,
  className,
  lightText,
  block = false,
  variant,
}) => {
  // Text color
  const textColor = lightText || variant == 'button-primary' ? 'text-white' : 'text-black';

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
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <NextLink className={classes} href={href}>
      {children}
    </NextLink>
  );
};

export default Link;
