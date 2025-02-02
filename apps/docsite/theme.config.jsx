import { defineConfig } from 'nextra';

export default defineConfig({
  theme: 'nextra-theme-docs',
  themeConfig: {
    footer: {
      text: `GPL2+. ${new Date().getFullYear()} © Eventuras.`,
    },
    logo: <span>Eventuras Documentation</span>,
    project: {
      link: 'https://github.com/losol/eventuras'
    },
    docsRepositoryBase: 'https://github.com/losol/eventuras/tree/main/docs'
  }
});
