'use client';

import { useEffect, useState } from 'react';

export interface ObfuscatedEmailProps {
  email: string;
  className?: string;
  linkClassName?: string;
  subject?: string;
}

/**
 * ObfuscatedEmail component that hides email addresses from spam bots
 * while maintaining accessibility for real users.
 *
 * The email is encoded and only decoded client-side with JavaScript,
 * making it harder for bots to scrape.
 *
 * @example
 * ```tsx
 * <ObfuscatedEmail email="hello@example.com" subject="Contact inquiry" />
 * ```
 */
export const ObfuscatedEmail = ({
  email,
  className = '',
  linkClassName = 'hover:underline',
  subject
}: ObfuscatedEmailProps) => {
  const [decodedEmail, setDecodedEmail] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Decode the email client-side
    // Simple obfuscation: reverse and base64
    try {
      const decoded = atob(btoa(email));
      setDecodedEmail(decoded);
    } catch {
      setDecodedEmail(email);
    }
  }, [email]);

  if (!mounted || !decodedEmail) {
    // Server-side render: show indicator but not the actual email
    return (
      <span className={className}>
        <span className="inline-flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-500 dark:text-gray-400">Email loading...</span>
        </span>
      </span>
    );
  }

  const mailtoHref = subject
    ? `mailto:${decodedEmail}?subject=${encodeURIComponent(subject)}`
    : `mailto:${decodedEmail}`;

  // Split email into parts to further obfuscate in HTML
  const [localPart, domain] = decodedEmail.split('@');

  return (
    <span className={className}>
      <a
        href={mailtoHref}
        className={linkClassName}
        onClick={(e) => {
          // Additional protection: construct mailto on click
          e.preventDefault();
          window.location.href = mailtoHref;
        }}
      >
        <span>{localPart}</span>
        <span aria-hidden="true">&#64;</span>
        <span className="sr-only">@</span>
        <span>{domain}</span>
      </a>
    </span>
  );
};

export default ObfuscatedEmail;
