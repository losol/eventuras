import type { MetadataRoute } from 'next';

import getSiteSettings from '@/utils/site/getSiteSettings';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const siteSettings = await getSiteSettings();

  const name = siteSettings?.name ?? 'Eventuras';
  const description =
    siteSettings?.description ?? 'A platform for managing courses, events, and conferences';

  return {
    name,
    short_name: name,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/assets/eventuras.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/assets/favicon.ico',
        sizes: '16x16 32x32 48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
