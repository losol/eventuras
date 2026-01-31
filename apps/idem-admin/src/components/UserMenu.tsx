'use client';

import { LogOut, User as UserIcon } from 'lucide-react';

import { Button } from '@eventuras/ratio-ui/core/Button';

type User = {
  name?: string;
  email?: string;
  systemRole?: string;
};

type UserMenuProps = {
  user?: User;
};

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <a href="/api/login">
        <Button variant="secondary" size="sm">
          Login
        </Button>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-white">
        <UserIcon className="h-4 w-4" />
        <span className="text-sm">{user.name || user.email}</span>
        {user.systemRole && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            {user.systemRole}
          </span>
        )}
      </div>
      <a href="/api/logout">
        <Button variant="secondary" size="sm">
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </a>
    </div>
  );
}
