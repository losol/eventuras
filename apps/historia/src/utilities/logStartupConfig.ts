/**
 * Log startup configuration to help debug production issues
 * Shows which features are enabled and key environment variables
 */
export function logStartupConfig() {
  if (typeof window !== 'undefined') {
    // Don't log on client-side
    return;
  }

  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           Historia CMS - Startup Configuration            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Environment
  console.log('📋 Environment:');
  console.log(`   NODE_ENV: ${nodeEnv}`);
  console.log(`   Next.js URL: ${process.env.NEXT_PUBLIC_CMS_URL || 'not set'}`);
  console.log(`   Default Locale: ${process.env.NEXT_PUBLIC_CMS_DEFAULT_LOCALE || 'not set'}`);

  // Feature Flags
  console.log('\n🚀 Feature Flags:');
  const features = {
    'Sentry Error Tracking': process.env.NEXT_PUBLIC_FEATURE_SENTRY === 'true',
  };

  Object.entries(features).forEach(([name, enabled]) => {
    const status = enabled ? '✅ ENABLED' : '❌ DISABLED';
    console.log(`   ${name}: ${status}`);
  });

  // Sentry Configuration (only if enabled)
  if (process.env.NEXT_PUBLIC_FEATURE_SENTRY === 'true') {
    console.log('\n🔍 Sentry Configuration:');
    console.log(`   Server DSN: ${process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ configured' : '❌ missing'}`);
    console.log(
      `   Client DSN: ${process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ configured' : '❌ missing'}`
    );
    console.log(`   Organization: ${process.env.CMS_SENTRY_ORG || 'not set'}`);
    console.log(`   Project: ${process.env.CMS_SENTRY_PROJECT || 'not set'}`);
    console.log(
      `   Send PII: ${process.env.NEXT_PUBLIC_CMS_SENTRY_SEND_DEFAULT_PII === 'true' ? 'yes' : 'no'}`
    );
  }

  // Database Configuration
  console.log('\n💾 Database:');
  console.log(`   Type: ${process.env.DATABASE_ADAPTER || 'not set'}`);
  console.log(`   URI: ${process.env.DATABASE_URI ? '✅ configured' : '❌ missing'}`);

  // CORS & Security Configuration
  console.log('\n🔒 CORS & Security:');
  const allowedOrigins = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_CMS_URL;
  console.log(`   Server URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'not set'}`);
  console.log(`   Allowed Origins: ${allowedOrigins || 'not configured'}`);
  console.log(`   CORS Credentials: ${process.env.CORS_CREDENTIALS || 'not set'}`);
  console.log(`   Cookie Domain: ${process.env.COOKIE_DOMAIN || 'not set'}`);
  console.log(
    `   Cookie Secure: ${process.env.COOKIE_SECURE === 'true' ? 'yes' : 'no (HTTP allowed)'}`
  );
  console.log(
    `   Cookie SameSite: ${process.env.COOKIE_SAME_SITE || 'lax (default)'}`
  );

  // Session & Authentication
  console.log('\n🔑 Session & Auth:');
  console.log(
    `   Session Secret: ${process.env.PAYLOAD_SECRET ? '✅ configured' : '❌ missing'}`
  );
  console.log(
    `   Session Max Age: ${process.env.SESSION_MAX_AGE || '30 days (default)'}`
  );
  console.log(
    `   CSRF Protection: ${process.env.DISABLE_CSRF !== 'true' ? '✅ enabled' : '⚠️ disabled'}`
  );

  // Email Configuration
  console.log('\n📧 Email:');
  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  console.log(`   From Address: ${emailFrom || 'not configured'}`);
  console.log(`   SMTP Host: ${process.env.SMTP_HOST || 'not configured'}`);
  console.log(`   SMTP Port: ${process.env.SMTP_PORT || 'not configured'}`);
  console.log(`   SMTP Secure: ${process.env.SMTP_SECURE === 'true' ? 'yes (TLS)' : 'no'}`);
  console.log(
    `   SMTP User: ${process.env.SMTP_USER ? '✅ configured' : 'not configured'}`
  );

  // Storage Configuration
  console.log('\n📦 Storage:');
  const s3Vars = [
    'CMS_MEDIA_S3_ACCESS_KEY_ID',
    'CMS_MEDIA_S3_ENDPOINT',
    'CMS_MEDIA_S3_SECRET_ACCESS_KEY',
    'CMS_MEDIA_S3_REGION',
    'CMS_MEDIA_S3_BUCKET',
  ];
  const hasS3 = s3Vars.every((v) => !!process.env[v]);
  console.log(`   S3 Media Storage: ${hasS3 ? '✅ configured' : '❌ not configured'}`);
  if (hasS3) {
    console.log(`   S3 Endpoint: ${process.env.CMS_MEDIA_S3_ENDPOINT}`);
    console.log(`   S3 Region: ${process.env.CMS_MEDIA_S3_REGION}`);
    console.log(`   S3 Bucket: ${process.env.CMS_MEDIA_S3_BUCKET}`);
  }
  // Vipps Configuration
  console.log('\n💳 Payment (Vipps):');
  console.log(`   Test Mode: ${process.env.VIPPS_USE_TEST_MODE === 'true' ? '✅ yes' : 'no'}`);
  console.log(`   Client ID: ${process.env.VIPPS_CLIENT_ID ? '✅ configured' : '❌ missing'}`);
  console.log(
    `   Client Secret: ${process.env.VIPPS_CLIENT_SECRET ? '✅ configured' : '❌ missing'}`
  );
  console.log(
    `   Subscription Key: ${process.env.VIPPS_SUBSCRIPTION_KEY ? '✅ configured' : '❌ missing'}`
  );
  console.log(`   MSN: ${process.env.VIPPS_MSN || 'not set'}`);

  console.log('\n════════════════════════════════════════════════════════════\n');
}
