#!/usr/bin/env tsx

/**
 * OAuth Server for obtaining Google refresh token
 *
 * This script starts a temporary server to handle the OAuth callback
 * and exchange the authorization code for a refresh token.
 *
 * Usage:
 *   pnpm oauth:setup
 *
 * Prerequisites:
 *   1. Set up Google Cloud Console OAuth credentials
 *   2. Add http://localhost:3123/oauth/callback to Authorized redirect URIs
 *   3. Set EVENTURAS_TEST_GOOGLE_CLIENT_ID and EVENTURAS_TEST_GOOGLE_CLIENT_SECRET in .env
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, parse } from 'node:url';
import { dirname, join } from 'node:path';
import { createOAuthClient, generateOAuthConsentUrl, exchangeCodeForTokens } from '@eventuras/google-api';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) return;
    const key = trimmed.substring(0, equalsIndex).trim();
    const value = trimmed.substring(equalsIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

const PORT = 3123;
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`;

// Validate required environment variables
if (!process.env.EVENTURAS_TEST_GOOGLE_CLIENT_ID || !process.env.EVENTURAS_TEST_GOOGLE_CLIENT_SECRET) {
  console.error('❌ Error: EVENTURAS_TEST_GOOGLE_CLIENT_ID and EVENTURAS_TEST_GOOGLE_CLIENT_SECRET must be set in .env');
  process.exit(1);
}

const oauth2Client = createOAuthClient({
  clientId: process.env.EVENTURAS_TEST_GOOGLE_CLIENT_ID,
  clientSecret: process.env.EVENTURAS_TEST_GOOGLE_CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);

  if (parsedUrl.pathname === '/auth') {
    // Redirect to Google OAuth consent screen
    // Note: gmail.modify scope is required to trash messages
    const authUrl = generateOAuthConsentUrl(oauth2Client, {
      scope: ['https://www.googleapis.com/auth/gmail.modify'],
    });
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  if (parsedUrl.pathname === '/oauth/callback') {
    const code = parsedUrl.query.code as string;

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Error: No authorization code received</h1>');
      return;
    }

    try {
      const tokens = await exchangeCodeForTokens(oauth2Client, code);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>OAuth Success</title></head>
          <body>
            <h1>Successfully obtained refresh token!</h1>
            <h2>Add this to your .env file:</h2>
            <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
            </pre>
            <p><strong>Important:</strong> This token will only be shown once. Copy it now!</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);

      console.log('\nSuccess! Refresh token obtained.');
      console.log('\nAdd this line to your .env file:');
      console.log(`EVENTURAS_TEST_GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

      // Close server after successful token exchange
      setTimeout(() => {
        console.log('🔒 Shutting down OAuth server...');
        server.close();
        process.exit(0);
      }, 1000);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Error obtaining tokens</h1><p>Check the console for details.</p>');
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 OAuth server running at http://localhost:${PORT}`);
  console.log(`\n📖 Next steps:`);
  console.log(`   1. Open this URL in your browser:`);
  console.log(`      http://localhost:${PORT}/auth`);
  console.log(`   2. Authorize the application`);
  console.log(`   3. Copy the refresh token to your .env file\n`);
});
