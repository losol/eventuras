import { redirect } from 'next/navigation';

export default function LocaleRedirect() {
  const defaultLocale = process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'en';

  // Redirect to the default locale
  redirect(`/${defaultLocale}`);
}
