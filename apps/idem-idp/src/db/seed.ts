import { db } from './client';
import * as schema from './schema/index';
import { hashPassword } from '../crypto/hash';

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
    // Generate scrypt hash for dev client secret
    const devClientSecret = 'dev_secret_DO_NOT_USE_IN_PRODUCTION';
    const clientSecretHash = await hashPassword(devClientSecret);

    // 1. Create test accounts
    console.log('Creating test accounts...');

    const [adminAccount] = await db
      .insert(schema.accounts)
      .values({
        primaryEmail: 'admin@eventuras.local',
        givenName: 'Admin',
        familyName: 'User',
        displayName: 'Admin User',
        active: true,
      })
      .returning();
    if (!adminAccount) throw new Error('Failed to create admin account');

    const [devAccount] = await db
      .insert(schema.accounts)
      .values({
        primaryEmail: 'developer@eventuras.local',
        givenName: 'Developer',
        familyName: 'User',
        displayName: 'Developer User',
        active: true,
      })
      .returning();
    if (!devAccount) throw new Error('Failed to create dev account');

    const [testAccount] = await db
      .insert(schema.accounts)
      .values({
        primaryEmail: 'test@eventuras.local',
        givenName: 'Test',
        familyName: 'User',
        displayName: 'Test User',
        active: true,
      })
      .returning();
    if (!testAccount) throw new Error('Failed to create test account');

    console.log(`✓ Created 3 accounts (admin has system_admin role)`);

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

    // 3. Create OAuth clients (including idem-admin)
    console.log('Creating OAuth clients...');

    // Create idem-admin client first (required for RBAC)
    const [idemAdminClient] = await db
      .insert(schema.oauthClients)
      .values({
        clientId: 'idem-admin',
        clientName: 'Idem Admin Console',
        clientType: 'confidential',
        clientCategory: 'internal',
        clientSecretHash, // Same dev secret as dev_api_client
        redirectUris: [
          'http://localhost:3200/admin/callback',
          'http://localhost:3201/callback',
          'https://admin.idem.local/callback',
        ],
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code'],
        allowedScopes: ['openid', 'profile', 'email', 'offline_access'],
        defaultScopes: ['openid', 'profile', 'email'],
        requirePkce: true,
        active: true,
      })
      .returning();
    if (!idemAdminClient) throw new Error('Failed to create idem-admin client');

    await db.insert(schema.oauthClients).values([
      {
        clientId: 'dev_web_app',
        clientName: 'Development Web App',
        clientType: 'public',
        clientCategory: 'internal',
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
        clientCategory: 'internal',
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

    console.log(`✓ Created 3 OAuth clients (including idem-admin)`);

    // 4. Create RBAC roles for idem-admin (ADR 0018)
    console.log('Creating RBAC roles...');

    const [systemadminRole] = await db
      .insert(schema.clientRoles)
      .values({
        oauthClientId: idemAdminClient.id,
        roleName: 'systemadmin',
        description: 'Full administrative access to Idem',
      })
      .returning();
    if (!systemadminRole) throw new Error('Failed to create systemadmin role');

    const [adminReaderRole] = await db
      .insert(schema.clientRoles)
      .values({
        oauthClientId: idemAdminClient.id,
        roleName: 'admin_reader',
        description: 'Read-only access to Idem admin panel',
      })
      .returning();
    if (!adminReaderRole) throw new Error('Failed to create admin_reader role');

    console.log(`✓ Created 2 client roles for idem-admin`);

    // 5. Grant systemadmin role to admin account
    console.log('Granting roles...');

    await db.insert(schema.roleGrants).values({
      accountId: adminAccount.id,
      clientRoleId: systemadminRole.id,
    });

    console.log(`✓ Granted systemadmin role to admin@eventuras.local`);

    // 6. Create test IdP providers
    console.log('Creating IdP providers...');

    await db.insert(schema.idpProviders).values([
      {
        providerKey: 'mock_vipps',
        providerName: 'Vipps (Mock)',
        providerType: 'oidc',
        displayName: 'Vipps (Dev Only)',
        enabled: true,
        // Config fields are nullable - not configured in seed data
      },
      {
        providerKey: 'mock_google',
        providerName: 'Google (Mock)',
        providerType: 'oidc',
        displayName: 'Google (Dev Only)',
        enabled: true,
        // Config fields are nullable - not configured in seed data
      },
    ]);

    console.log(`✓ Created 2 mock IdP providers`);

    console.log('');
    console.log('✅ Seeding complete!');
    console.log('');
    console.log('Test accounts:');
    console.log('  - admin@eventuras.local (systemadmin role for idem-admin)');
    console.log('  - developer@eventuras.local');
    console.log('  - test@eventuras.local');
    console.log('');
    console.log('OAuth clients:');
    console.log('  - idem-admin (Idem Admin Console)');
    console.log('  - dev_web_app (public, PKCE required)');
    console.log(`  - dev_api_client (confidential, secret: ${devClientSecret})`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
