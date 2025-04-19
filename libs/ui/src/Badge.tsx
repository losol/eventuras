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
  let variantClass = '';

  if (variant === 'neutral') {
    variantClass = 'bg-gray-500 dark:bg-gray-700';
  } else if (variant === 'info') {
    variantClass = 'bg-blue-500 dark:bg-blue-700';
  } else if (variant === 'positive') {
    variantClass = 'bg-green-500 dark:bg-green-700';
  } else if (variant === 'negative') {
    variantClass = 'bg-red-500 dark:bg-red-700';
  }

  const blockClass = block ? 'block py-2 my-2' : '';

  const allClasses = `
    ${blockClass}
    ${variantClass}
    px-2 py-1 text-xs font-semibold leading-none text-white rounded-xs
    ${className}
  `.trim();

  return <span className={allClasses}>{children}</span>;
};

export default Badge;