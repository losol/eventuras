import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'neutral' | 'info' | 'positive' | 'negative';
  block?: boolean;
  definition?: boolean;
  label?: string;
};

const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'neutral',
  block = false,
  definition = false,
  label,
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

  if (definition && label) {
    // Definition mode: semantic definition list structure
    const allClasses = `
      ${blockClass}
      ${variantClass}
      flex overflow-hidden rounded text-xs leading-none text-white
      ${className}
    `.trim();

    return (
      <span className={allClasses}>
        <dt className="bg-black/20 px-2 py-2 font-medium uppercase tracking-wide">
          {label}
        </dt>
        <dd className="px-2 py-2 m-0">
          {children}
        </dd>
      </span>
    );
  }

  // Regular badge mode
  const allClasses = `
    ${blockClass}
    ${variantClass}
    p-2 text-xs leading-none text-white rounded
    ${className}
  `.trim();

  return <span className={allClasses}>{children}</span>;
};

export default Badge;
