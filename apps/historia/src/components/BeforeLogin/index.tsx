'use client';

import React from 'react';

import { VippsLoginButton } from './VippsLoginButton';

const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Los Dash!</b>
        {' This is where site admins will log in to manage your website.'}
      </p>
      <VippsLoginButton />
    </div>
  );
};

export default BeforeLogin;
