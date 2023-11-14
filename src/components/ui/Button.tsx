import React from 'react';

import Loading from '@/components/ui/Loading';
import { TEST_ID_ATTRIBUTE } from '@/utils/constants';

export const buttonStyles = {
  basePadding: 'px-4 py-2',
  baseMargin: '',
  primary: 'font-bold bg-primary-600 dark:bg-primary-950 hover:bg-primary-700',
  secondary: 'border border-secondary-300 text-gray-700 hover:bg-secondary-100/10',
  light: 'bg-primary-100 text-gray-800 hover:bg-primary-200',
  transparent: 'bg-transparent hover:bg-primary-200 hover:bg-opacity-20',
  outline:
    'border border-gray-700 rounded text-primary-900 hover:border-primary-500 hover:text-primary-700 hover:bg-primary-100/10 dark:hover:bg-primary-900 transition duration-500',
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

const Button: React.FC<ButtonProps> = props => {
  const { variant = 'primary', bgDark = false, block = false } = props;

  let textColor;
  if (variant == 'primary' || bgDark) {
    textColor = 'text-white';
  } else {
    textColor = 'text-black dark:text-white';
  }

  const blockClassName = block ? 'block' : '';

  const buttonClassName =
    props.className ||
    [
      buttonStyles.basePadding,
      buttonStyles.baseMargin,
      buttonStyles[variant],
      blockClassName,
      textColor,
    ].join(' ');

  return (
    <div className="dark">
      <button
        disabled={props.disabled || props.loading}
        aria-label={props.ariaLabel}
        onClick={props.onClick}
        className={buttonClassName}
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
    </div>
  );
};

export default Button;
