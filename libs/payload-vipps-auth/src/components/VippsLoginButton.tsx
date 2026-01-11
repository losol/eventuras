/**
 * Vipps Login Button Component
 *
 * Displays a "Login with Vipps" button in Payload CMS login page.
 *
 * @example
 * ```typescript
 * // In your Payload config
 * import { VippsLoginButton } from '@eventuras/payload-vipps-auth';
 *
 * export default buildConfig({
 *   admin: {
 *     components: {
 *       beforeLogin: [VippsLoginButton],
 *     },
 *   },
 * });
 * ```
 */

'use client';

import React from 'react';

export interface VippsLoginButtonProps {
  /**
   * Text to display on the button
   * @default 'Logg inn med Vipps'
   */
  buttonText?: string;

  /**
   * Helper text to display below the button
   * @default 'eller bruk e-post og passord nedenfor'
   */
  helperText?: string;

  /**
   * Path to the Vipps login endpoint
   * @default '/api/auth/vipps/login'
   */
  loginPath?: string;
}

export const VippsLoginButton: React.FC<VippsLoginButtonProps> = ({
  buttonText = 'Logg inn med Vipps',
  helperText = 'eller bruk e-post og passord nedenfor',
  loginPath = '/api/auth/vipps/login',
}) => {
  const handleVippsLogin = () => {
    // Redirect to Vipps login endpoint
    window.location.href = loginPath;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        type="button"
        onClick={handleVippsLogin}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          backgroundColor: '#FF5B24', // Vipps orange color
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E54E1F';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FF5B24';
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="white"
          />
        </svg>
        {buttonText}
      </button>
      {helperText && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};
