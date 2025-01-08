import { redirect } from 'next/navigation';

export default function HomeRedirect() {
  const defaultLocale = process.env.CMS_DEFAULT_LOCALE || 'en';

  // Redirect to the default locale
  redirect(`/${defaultLocale}`);
}
