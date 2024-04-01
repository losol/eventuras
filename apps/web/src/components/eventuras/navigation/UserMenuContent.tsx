'use client';
import { Button } from '@eventuras/ui';

import Menu from '@/components/Menu';

export type LoggedOutLanguagePack = {
  loginLabel: string;
};

export type LogginInLanguagePack = {
  userLabel: string;
  accountLabel: string;
  adminLabel: string;
  logoutButtonLabel: string;
};

export type UserMenuContentLoggedOutProps = {
  onLoginRequested: () => void;
  languagePack: LoggedOutLanguagePack;
};

const UserMenuContentLoggedout = (props: UserMenuContentLoggedOutProps) => {
  return (
    <Button onClick={() => props.onLoginRequested()} variant="primary" data-test-id="login-button">
      {props.languagePack.loginLabel}
    </Button>
  );
};

export type UserMenuContentLoggedInProps = {
  onLogoutRequested: () => void;
  menuLabel: string;
  isAdmin: boolean;
  languagePack: LogginInLanguagePack;
};

const UserMenuContentLoggedIn = (props: UserMenuContentLoggedInProps) => {
  const { accountLabel, adminLabel, logoutButtonLabel, userLabel } = props.languagePack;
  return (
    <Menu>
      <Menu.Trigger data-test-id="logged-in-menu-button">{props.menuLabel}</Menu.Trigger>
      <Menu.Items>
        <Menu.Link data-test-id="profile-link" href="/user" closeOnClick={true}>
          {userLabel}
        </Menu.Link>
        <Menu.Link href="/user/account" closeOnClick={true}>
          {accountLabel}
        </Menu.Link>
        {props.isAdmin && (
          <Menu.Link href="/admin" closeOnClick={true}>
            {adminLabel}
          </Menu.Link>
        )}
        <Menu.Button onClick={() => props.onLogoutRequested()} data-test-id="logout-button">
          {logoutButtonLabel}
        </Menu.Button>
      </Menu.Items>
    </Menu>
  );
};

export default { LoggedIn: UserMenuContentLoggedIn, LoggedOut: UserMenuContentLoggedout };
