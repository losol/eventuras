'use client';
import { Button } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';

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
    <Button
      onClick={() => props.onLoginRequested()}
      variant="primary"
      {...{ [DATA_TEST_ID]: 'login-button' }}
    >
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
      <Menu.Trigger {...{ [DATA_TEST_ID]: 'logged-in-menu-button' }}>
        {props.menuLabel}
      </Menu.Trigger>
      <Menu.Items>
        <Menu.Link {...{ [DATA_TEST_ID]: 'profile-link' }} href="/user" closeOnClick={true}>
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
        <Menu.Button
          onClick={() => props.onLogoutRequested()}
          {...{ [DATA_TEST_ID]: 'logout-button' }}
        >
          {logoutButtonLabel}
        </Menu.Button>
      </Menu.Items>
    </Menu>
  );
};

export default { LoggedIn: UserMenuContentLoggedIn, LoggedOut: UserMenuContentLoggedout };
