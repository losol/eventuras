#!/usr/bin/env tsx

/**
 * OAuth Server for obtaining Google refresh token.
 *
 * This script starts a temporary server to handle the OAuth callback and
 * exchanges the authorization code for a refresh token.
 *
 * By default the token is only printed (terminal + browser page) so a human
 * can paste it into .env. To rotate the CI secret in one shot, set
 * OAUTH_PUSH_GH_SECRET=1 — the new token is then pushed straight into a
 * GitHub Actions environment secret via the `gh` CLI, no copy-paste.
 *
 * Usage:
 *   pnpm oauth:setup                       # local: prints the token
 *   OAUTH_PUSH_GH_SECRET=1 pnpm oauth:setup # CI rotation: pushes to GitHub
 *
 * Prerequisites:
 *   1. Set up Google Cloud Console OAuth credentials.
 *   2. Add http://localhost:3123/oauth/callback to Authorized redirect URIs.
 *   3. Set E2E_GMAIL_CLIENT_ID and E2E_GMAIL_CLIENT_SECRET in .env.
 *   4. For the push path: `gh` CLI installed and authenticated against a user
 *      with write access to the target repo + environment named by
 *      GH_SECRET_REPO / GH_SECRET_ENV. Both are required when
 *      OAUTH_PUSH_GH_SECRET=1.
 *
 * Environment variables:
 *   OAUTH_PUSH_GH_SECRET  Set to "1" to push the new token into GitHub Actions
 *                         (opt-in). Default is print-only.
 *   GH_SECRET_REPO        Repo to push the secret into (required when pushing).
 *                         May be set in .env.
 *   GH_SECRET_ENV         Environment to push into (required when pushing).
 *                         May be set in .env.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, parse } from 'node:url';
import { dirname, join } from 'node:path';
import {
  createOAuthClient,
  generateOAuthConsentUrl,
  exchangeCodeForTokens,
} from '@eventuras/google-api';

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

const GH_SECRET_NAME = 'E2E_GMAIL_REFRESH_TOKEN';

// Validate required environment variables
if (
  !process.env.E2E_GMAIL_CLIENT_ID ||
  !process.env.E2E_GMAIL_CLIENT_SECRET
) {
  console.error(
    '❌ Error: E2E_GMAIL_CLIENT_ID and E2E_GMAIL_CLIENT_SECRET must be set in .env'
  );
  process.exit(1);
}

const oauth2Client = createOAuthClient({
  clientId: process.env.E2E_GMAIL_CLIENT_ID,
  clientSecret: process.env.E2E_GMAIL_CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

interface PushResult {
  ok: boolean;
  /** Human-readable error message when ok=false; never includes the token value. */
  error?: string;
}

/**
 * Push the refresh token to a GitHub Actions environment secret using `gh`.
 * The token is sent via stdin so it never appears in argv or shell history.
 */
function pushSecretToGitHub(token: string, repo: string, env: string): Promise<PushResult> {
  return new Promise(resolve => {
    let child;
    try {
      child = spawn(
        'gh',
        ['secret', 'set', GH_SECRET_NAME, '--repo', repo, '--env', env],
        { stdio: ['pipe', 'inherit', 'inherit'] }
      );
    } catch (err) {
      resolve({ ok: false, error: err instanceof Error ? err.message : String(err) });
      return;
    }

    child.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        resolve({
          ok: false,
          error: '`gh` CLI not found on PATH (install from https://cli.github.com)',
        });
      } else {
        resolve({ ok: false, error: err.message });
      }
    });

    child.on('close', code => {
      if (code === 0) {
        resolve({ ok: true });
      } else {
        resolve({ ok: false, error: `gh exited with code ${code}` });
      }
    });

    child.stdin.write(token);
    child.stdin.end();
  });
}

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
      const refreshToken = tokens.refresh_token;

      // Always render the HTML view with the token — local .env seeding still
      // relies on being able to copy it out of the browser page.
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>OAuth Success</title></head>
          <body>
            <h1>Successfully obtained refresh token!</h1>
            <h2>Add this to your .env file:</h2>
            <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
E2E_GMAIL_REFRESH_TOKEN=${refreshToken}
            </pre>
            <p><strong>Important:</strong> This token will only be shown once. Copy it now!</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);

      const pushToGitHub = process.env.OAUTH_PUSH_GH_SECRET === '1';
      const repo = process.env.GH_SECRET_REPO;
      const env = process.env.GH_SECRET_ENV;

      console.log('\n✅ Refresh token obtained.');

      if (!pushToGitHub) {
        console.log('Add this to your .env (or set OAUTH_PUSH_GH_SECRET=1 to push to GitHub):');
        console.log(`\n${GH_SECRET_NAME}=${refreshToken}\n`);
      } else if (!repo || !env) {
        console.warn(
          '\n⚠️  OAUTH_PUSH_GH_SECRET=1 was set, but GH_SECRET_REPO and GH_SECRET_ENV are both required to push.'
        );
        console.warn('Set them (in .env or the environment) or run without the push flag.');
        console.warn('Falling back to printing the token:');
        console.warn(`\n${GH_SECRET_NAME}=${refreshToken}\n`);
      } else {
        console.log(`Pushing to ${repo} (env: ${env})...`);
        const result = await pushSecretToGitHub(refreshToken, repo, env);
        if (result.ok) {
          console.log(`✅ Pushed ${GH_SECRET_NAME} to ${repo} (env: ${env})`);
        } else {
          console.warn(`\n⚠️  Could not push secret via gh: ${result.error}`);
          console.warn('Falling back to manual setup — copy this token:');
          console.warn(`\n${GH_SECRET_NAME}=${refreshToken}\n`);
        }
      }

      // Close server after the callback is fully handled
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
  if (process.env.OAUTH_PUSH_GH_SECRET === '1') {
    const repo = process.env.GH_SECRET_REPO;
    const env = process.env.GH_SECRET_ENV;
    if (repo && env) {
      console.log(`   3. The refresh token will be pushed to ${repo} (env: ${env}).\n`);
    } else {
      console.log(
        `   3. OAUTH_PUSH_GH_SECRET=1 is set but GH_SECRET_REPO and GH_SECRET_ENV are missing — the token will be printed for fallback.\n`
      );
    }
  } else {
    console.log(`   3. The refresh token will be printed for you to add to .env.`);
    console.log(`      Set OAUTH_PUSH_GH_SECRET=1 to rotate the GitHub Actions secret directly.\n`);
  }
});
