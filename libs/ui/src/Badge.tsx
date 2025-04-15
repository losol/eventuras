import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'neutral' | 'info' | 'positive' | 'negative';
  block?: boolean;
};

const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'neutral',
  block = false,
}) => {
  const variantClasses = {
    neutral: 'bg-gray-500 dark:bg-gray-700',
    info: 'bg-blue-500 dark:bg-blue-700',
    positive: 'bg-green-500 dark:bg-green-700',
    negative: 'bg-red-500 dark:bg-red-700',
  };

  const blockClass = block ? 'block py-2 my-2' : '';

  return (
    <span
      className={`${blockClass} px-2 py-1 text-xs font-semibold leading-none text-white rounded-xs ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
