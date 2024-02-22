import React from 'react';

import Loading from '@eventuras/ui/Loading';
import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

import { BoxProps, spacingClassName } from './Box';

export const buttonStyles = {
  defaultPadding: 'px-4 py-2',
  primary: 'border font-bold bg-primary-600 dark:bg-primary-950 hover:bg-primary-700',
  secondary: 'border border-secondary-300 text-gray-700 hover:bg-secondary-100/10',
  light: 'bg-primary-100 text-gray-800 hover:bg-primary-200',
  transparent: 'bg-transparent hover:bg-primary-200 hover:bg-opacity-20',
  outline:
    'border border-gray-700 text-primary-900 hover:border-primary-500 hover:bg-primary-100/10 dark:hover:bg-primary-900 transition duration-500',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  bgDark?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'light' | 'transparent';
  block?: boolean;
  [TEST_ID_ATTRIBUTE]?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps & BoxProps>((props, ref) => {
  const { variant = 'primary', bgDark = false, block = false, ...boxProps } = props;

  let textColor;
  if (variant == 'primary' || bgDark) {
    textColor = 'text-white';
  } else {
    textColor = 'text-black dark:text-white';
  }

  const blockClassName = block ? 'block' : '';

  const spacing: string = spacingClassName(boxProps, {
    defaultPadding: buttonStyles.defaultPadding,
    defaultMargin: 'm-1',
  });

  const buttonClassName =
    props.className || [spacing, buttonStyles[variant], blockClassName, textColor].join(' ');

  return (
    <button
      ref={ref}
      disabled={props.disabled || props.loading}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      className={buttonClassName}
      type={props.type || 'button'}
      data-test-id={props[TEST_ID_ATTRIBUTE]}
    >
      {props.leftIcon && <span className={`mr-2 ${textColor}`}>{props.leftIcon}</span>}
      <span className={textColor}>{props.children}</span>
      {props.loading && (
        <div>
          <Loading />
        </div>
      )}
    </button>
  );
});
Button.displayName = 'Button';

export default Button;
