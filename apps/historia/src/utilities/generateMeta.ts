import type { Metadata } from 'next';

import { getServerSideURL } from './getURL';
import type { Article, Config, Media, Page } from '../payload-types';

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL();

  let url = serverUrl + '/images/historia.png';

  if (image && typeof image === 'object') {
    const ogUrl = image.sizes?.landscape?.url;

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url;
  }

  return url;
};

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Article>;
}): Promise<Metadata> => {
  const { doc } = args || {};

  const title = doc?.title ?? 'Historia';
  const description = doc?.lead ?? undefined;

  const ogImage = getImageURL(doc?.image?.media);

  return {
    title,
    description: description,
    openGraph: {
      title,
      description: description,
      images: ogImage,
    }
  };
};
