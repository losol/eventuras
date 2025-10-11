/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://docs.eventuras.losol.io',
  generateRobotsTxt: true,
  exclude: ['/404'],
};
