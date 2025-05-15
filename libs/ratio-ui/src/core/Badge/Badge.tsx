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
    variantClass = 'bg-gray-700 dark:bg-gray-800';
  } else if (variant === 'info') {
    variantClass = 'bg-blue-600 dark:bg-blue-800';
  } else if (variant === 'positive') {
    variantClass = 'bg-green-700 dark:bg-green-800';
  } else if (variant === 'negative') {
    variantClass = 'bg-red-600 dark:bg-red-800 text-white';
  }

  const blockClass = block ? 'block' : '';

  const allClasses = `
    ${blockClass}
    ${variantClass}
    p-2 text-xs leading-none text-white rounded
    ${className}
  `.trim();

  return <span className={allClasses}>{children}</span>;
};

export default Badge;
