'use client';

import { SearchField as AriaSearchField } from 'react-aria-components';
import type { ComponentProps } from 'react';

export type SearchFieldProps = ComponentProps<typeof AriaSearchField>;

/**
 * SearchField with ratio-ui defaults.
 */
export function SearchField({ className, ...props }: SearchFieldProps) {
  return <AriaSearchField className={className ?? 'flex flex-col gap-1'} {...props} />;
}
