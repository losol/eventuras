import React from 'react';
import './Blockquote.css';

export interface BlockquoteProps {
  children: React.ReactNode;
  className?: string;
  cite?: string;
}

/**
 * Blockquote component with warm, collective styling
 */
export const Blockquote: React.FC<BlockquoteProps> = ({
  children,
  className = '',
  cite
}) => {
  return (
    <blockquote className={className} cite={cite}>
      {children}
    </blockquote>
  );
};

export default Blockquote;
