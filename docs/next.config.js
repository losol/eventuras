/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  basePath: "/eventuras",
  images: { unoptimized: true },
  output: "export",
};

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

module.exports = withNextra(nextConfig);

