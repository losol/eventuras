import bcrypt from 'bcrypt';
import { db } from './client';
import * as schema from './schema/index';

/**
 * Development seed script
 *
 * Populates the database with test data for local development.
 * Only run this in development environment!
 *
 * NOTE: This script assumes a clean database. Running it multiple times
 * will fail due to unique constraints on emails and other fields.
 * To re-seed, drop and recreate the schema first.
 */

async function seed() {
  console.log('🌱 Seeding development database...');

  // Check environment
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot run seed in production!');
    process.exit(1);
  }

  try {
    // Generate bcrypt hash for dev client secret
    const devClientSecret = 'dev_secret_DO_NOT_USE_IN_PRODUCTION';
    const clientSecretHash = await bcrypt.hash(devClientSecret, 10);

    // 1. Create test accounts
    console.log('Creating test accounts...');

    const [adminAccount] = await db
      .insert(schema.accounts)
      .values({
        primaryEmail: 'admin@eventuras.local',
        displayName: 'Admin User',
        active: true,
      })
      .returning();
    if (!adminAccount) throw new Error('Failed to create admin account');

    const [devAccount] = await db
      .insert(schema.accounts)
      .values({
        primaryEmail: 'developer@eventuras.local',
        displayName: 'Developer User',
        active: true,
      })
      .returning();
    if (!devAccount) throw new Error('Failed to create dev account');

    const [testAccount] = await db
      .insert(schema.accounts)
      .values({
        primaryEmail: 'test@eventuras.local',
        displayName: 'Test User',
        active: true,
      })
      .returning();
    if (!testAccount) throw new Error('Failed to create test account');

    console.log(`✓ Created 3 accounts`);

    // 2. Create identities for accounts
    console.log('Creating identities...');

    await db.insert(schema.identities).values([
      {
        accountId: adminAccount.id,
        provider: 'email_otp',
        providerSubject: adminAccount.id,
        isPrimary: true,
        emailVerified: true,
      },
      {
        accountId: devAccount.id,
        provider: 'email_otp',
        providerSubject: devAccount.id,
        isPrimary: true,
        emailVerified: true,
      },
      {
        accountId: testAccount.id,
        provider: 'email_otp',
        providerSubject: testAccount.id,
        isPrimary: true,
        emailVerified: true,
      },
    ]);

    console.log(`✓ Created 3 identities`);

    // 3. Create admin principals
    console.log('Creating admin principals...');

    const [adminPrincipal] = await db
      .insert(schema.adminPrincipals)
      .values({
        accountId: adminAccount.id,
        displayName: 'Admin User',
        email: 'admin@eventuras.local',
      })
      .returning();
    if (!adminPrincipal) throw new Error('Failed to create admin principal');

    console.log(`✓ Created 1 admin principal`);

    // 4. Grant admin role
    console.log('Granting admin roles...');

    await db.insert(schema.adminMemberships).values({
      principalId: adminPrincipal.id,
      role: 'system_admin',
    });

    console.log(`✓ Granted system_admin role to admin@eventuras.local`);

    // 5. Create test OAuth client
    console.log('Creating OAuth clients...');

    await db.insert(schema.oauthClients).values([
      {
        clientId: 'dev_web_app',
        clientName: 'Development Web App',
        clientType: 'public',
        redirectUris: ['http://localhost:3000/callback', 'http://localhost:3000/auth/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code'],
        allowedScopes: ['openid', 'profile', 'email', 'offline_access'],
        defaultScopes: ['openid', 'profile', 'email'],
        requirePkce: true,
        active: true,
      },
      {
        clientId: 'dev_api_client',
        clientName: 'Development API Client',
        clientType: 'confidential',
        clientSecretHash, // Hashed 'dev_secret_DO_NOT_USE_IN_PRODUCTION'
        redirectUris: ['http://localhost:4000/callback'],
        grantTypes: ['authorization_code', 'refresh_token', 'client_credentials'],
        responseTypes: ['code'],
        allowedScopes: ['openid', 'profile', 'email', 'api'],
        defaultScopes: ['openid', 'profile'],
        requirePkce: true,
        active: true,
      },
    ]);

    console.log(`✓ Created 2 OAuth clients`);

    // 6. Create test IdP providers
    console.log('Creating IdP providers...');

    await db.insert(schema.idpProviders).values([
      {
        providerKey: 'mock_vipps',
        providerName: 'Vipps (Mock)',
        providerType: 'oidc',
        displayName: 'Vipps (Dev Only)',
        enabled: true,
      },
      {
        providerKey: 'mock_google',
        providerName: 'Google (Mock)',
        providerType: 'oidc',
        displayName: 'Google (Dev Only)',
        enabled: true,
      },
    ]);

    console.log(`✓ Created 2 mock IdP providers`);

    console.log('');
    console.log('✅ Seeding complete!');
    console.log('');
    console.log('Test accounts:');
    console.log('  - admin@eventuras.local (system_admin role)');
    console.log('  - developer@eventuras.local');
    console.log('  - test@eventuras.local');
    console.log('');
    console.log('OAuth clients:');
    console.log('  - dev_web_app (public, PKCE required)');
    console.log(`  - dev_api_client (confidential, secret: ${devClientSecret})`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
