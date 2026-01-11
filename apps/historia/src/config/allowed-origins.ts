export const allowedOrigins = process.env.CMS_ALLOWED_ORIGINS
  ? process.env.CMS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];
