import Environment from '@/utils/Environment';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = Environment.NEXT_PUBLIC_DEFAULT_LOCALE || 'en-US';

  const messages = {
    admin: { ...(await import(`../../locales/${locale}/admin.json`)).default },
    common: { ...(await import(`../../locales/${locale}/common.json`)).default },
    user: { ...(await import(`../../locales/${locale}/user.json`)).default },
  };

  return {
    locale,
    messages,
  };
});
