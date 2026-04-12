import React from 'react';
import { ErrorBlock } from '../Error';

export interface NotFoundProps {
  /** Page title (defaults to "404") */
  title?: string;
  /** Description message (defaults to "This page could not be found.") */
  message?: string;
  /** Additional details or helpful text */
  details?: string;
  /** Action buttons/links */
  actions?: React.ReactNode;
  /** Custom className for the container */
  className?: string;
}

/**
 * NotFound block component for displaying 404 pages
 *
 * @example
 * ```tsx
 * <NotFound
 *   title="404"
 *   message="This page could not be found."
 *   actions={<Button href="/">Go home</Button>}
 * />
 * ```
 */
export const NotFound: React.FC<NotFoundProps> = ({
  title = '404',
  message = 'This page could not be found.',
  details,
  actions,
  className,
}) => {
  return (
    <ErrorBlock type="not-found" status="info" className={className}>
      <ErrorBlock.Title>{title}</ErrorBlock.Title>
      <ErrorBlock.Description>{message}</ErrorBlock.Description>
      {details && <ErrorBlock.Details>{details}</ErrorBlock.Details>}
      {actions && <ErrorBlock.Actions>{actions}</ErrorBlock.Actions>}
    </ErrorBlock>
  );
};
