import type { MetadataRoute } from 'next';

import getSiteSettings from '@/utils/site/getSiteSettings';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const siteSettings = await getSiteSettings();

  const name = siteSettings?.name ?? 'Eventuras';
  const description = siteSettings?.description ?? 'A life with eventuras';

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
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/assets/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
