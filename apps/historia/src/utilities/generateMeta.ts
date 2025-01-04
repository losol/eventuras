import type { Metadata } from 'next';

import type { Article, Media, Page, Config } from '../payload-types';

import { mergeOpenGraph } from './mergeOpenGraph';
import { getServerSideURL } from './getURL';

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL();

  let url = serverUrl + '/website-template-OG.webp';

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.standard?.url;

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url;
  }

  return url;
};

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Article>;
}): Promise<Metadata> => {
  const { doc } = args || {};

  const ogImage = getImageURL(doc?.image?.media);

  const title = doc?.title;

  return {
    // description: doc?.description || doc?.lead || '',
    openGraph: mergeOpenGraph({
      // description: doc?.description || '',
      images: ogImage
        ? [
          {
            url: ogImage,
          },
        ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  };
};
