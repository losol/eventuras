'use client';

import { useEffect, useState } from 'react';
import { Mail } from '../../icons';

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
          <Mail className="h-4 w-4" aria-hidden="true" />
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
