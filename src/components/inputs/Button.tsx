import React from 'react';

import { Loading } from '../feedback';

export const buttonStyles = {
  basePadding: 'px-4 py-2',
  baseMargin: 'm-2',
  primary: 'font-bold bg-primary-600 dark:bg-primary-950 hover:bg-primary-700',
  secondary: 'border border-gray-300 text-gray-700 hover:bg-primary-100',
  light: 'bg-primary-100 text-gray-800 hover:bg-primary-200',
  transparent: 'bg-transparent hover:bg-primary-200 hover:bg-opacity-20',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  lightText?: boolean;
  variant?: 'primary' | 'secondary' | 'light' | 'transparent';
}
export const blueBlockClasses =
  'bg-sky-400 dark:bg-sky-950 hover:bg-sky-700 text-white font-bold my-6 py-4 px-4 flex flex-row';

const Button: React.FC<ButtonProps> = props => {
  const { variant = 'primary', lightText = false } = props;

  let textColor;
  if (variant == 'primary' || lightText) {
    textColor = 'text-white';
  } else {
    textColor = 'text-black';
  }

  const buttonClassName =
    props.className ||
    `${buttonStyles.basePadding} ${buttonStyles.baseMargin} ${buttonStyles[variant]} ${textColor}`;

  return (
    <button
      disabled={props.disabled || props.loading}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      className={buttonClassName}
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
};

export default Button;
