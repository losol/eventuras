import type { Payload } from 'payload';

/**
 * Seeds a default website and home page if none exists.
 * This is useful for initial setup to ensure there's always a default tenant.
 */
export async function seedDefaultWebsite(payload: Payload): Promise<void> {
  const existingWebsites = await payload.find({
    collection: 'websites',
    limit: 1,
  });

  if (existingWebsites.totalDocs > 0) {
    payload.logger.info('Website already exists, skipping seed');
    return;
  }

  const defaultHost = process.env.NEXT_PUBLIC_CMS_URL
    ? new URL(process.env.NEXT_PUBLIC_CMS_URL).host
    : 'localhost:3100';

  payload.logger.info(`Creating default website with domain: ${defaultHost}`);

  // Create the website first (needed for multi-tenant)
  const website = await payload.create({
    collection: 'websites',
    data: {
      name: 'Historia Website',
      title: 'Historia Website',
      summary: 'Automatically created default website',
      domains: [defaultHost],
    },
  });

  // Create a simple default home page with tenant set
  const homePage = await payload.create({
    collection: 'pages',
    data: {
      name: 'Home',
      title: 'Welcome to Historia',
      slug: 'home',
      resourceId: 'home-page',
      _status: 'published',
      lead: 'This is your home page. Log in to the admin panel at /admin to edit this page and create your content.',
      tenant: website.id,
    },
    draft: false,
  });

  // Update the website to reference the home page
  await payload.update({
    collection: 'websites',
    id: website.id,
    data: {
      homePage: homePage.id,
    },
  });

  payload.logger.info('Successfully created default website and home page');
}
