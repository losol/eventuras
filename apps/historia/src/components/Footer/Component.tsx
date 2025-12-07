import React from 'react';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

import { Footer as FooterUI } from '@eventuras/ratio-ui/core/Footer';

import { getCurrentWebsiteId } from '@/lib/website';

import { FooterClient } from './Component.client';

export async function Footer() {
  const websiteId = await getCurrentWebsiteId();

  if (!websiteId) {
    return null;
  }

  const payload = await getPayload({ config: configPromise });
  const website = await payload.findByID({
    collection: 'websites',
    id: websiteId,
    depth: 2,
  });

  if (!website) {
    return null;
  }

  // Prepare publisher data
  const publisher =
    website.publisher && typeof website.publisher === 'object'
      ? {
          name: website.publisher.name,
          organizationNumber: website.publisher.organizationNumber || undefined,
          address:
            website.publisher.address?.addressLine1 ||
            website.publisher.address?.city ||
            '',
          phone: website.publisher.phone || '',
          email: website.publisher.email || '',
        }
      : undefined;

  return (
    <FooterUI siteTitle={website.title} publisher={publisher}>
      <FooterClient navigation={website.siteSettings?.footer?.navigation} />
    </FooterUI>
  );
}
