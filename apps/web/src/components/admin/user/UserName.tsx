'use client';

import { cn } from '@eventuras/ratio-ui/utils';

import { useUserDetails } from './UserDetailsProvider';

type UserNameProps = {
  /** A UserDto, or a UserSummaryDto, which names its id `userId`. */
  user?: {
    id?: string | null;
    userId?: string;
    name?: string | null;
    email?: string | null;
  } | null;
  className?: string;
};

/** A person's name that opens the admin user drawer; plain text where there is none. */
export function UserName({ user, className }: Readonly<UserNameProps>) {
  const details = useUserDetails();
  const label = user?.name || user?.email;
  if (!label) return null;

  const id = user?.id ?? user?.userId;
  if (!details || !id) {
    return <span className={className}>{label}</span>;
  }

  return (
    <button
      type="button"
      // Rows that open something themselves must not also react to the name.
      onClick={event => {
        event.stopPropagation();
        details.open(id);
      }}
      className={cn(
        'cursor-pointer text-left underline decoration-current/30 underline-offset-2 hover:decoration-current',
        className
      )}
    >
      {label}
    </button>
  );
}
