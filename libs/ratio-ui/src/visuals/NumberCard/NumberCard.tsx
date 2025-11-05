import React from 'react';
import { Card, CardProps } from '../../core/Card/Card';

interface NumberCardProps extends Omit<CardProps, 'children'> {
  number: number | undefined;
  label: string;
}

const NumberCard: React.FC<NumberCardProps> = ({
  number,
  label,
  className = '',
  ...cardProps
}) => {
  const combinedClassName = `text-center ${className}`.trim();

  return (
    <Card
      className={combinedClassName}
      {...cardProps}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="text-2xl font-bold leading-none text-gray-800 dark:text-white">
          {number ?? '—'}
        </div>
        <div className="text-sm font-medium mt-1 text-gray-600 dark:text-gray-300">
          {label}
        </div>
      </div>
    </Card>
  );
};

export default NumberCard;
