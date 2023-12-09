import NextLink from 'next/link';

import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

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
  [TEST_ID_ATTRIBUTE]?: string;
}

const Link: React.FC<LinkProps> = props => {
  // Text color
  const { href, children, className, bgDark = false, block = false, variant, stretch } = props;
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
    buttonStyles.defaultPadding,
    variantClasses,
    textColor,
    blockClasses,
    className,
    stretch ? 'stretched-link' : '',
  ].join(' ');

  return (
    <NextLink className={classes} href={href} data-test-id={props[TEST_ID_ATTRIBUTE]}>
      {children}
    </NextLink>
  );
};

export default Link;
