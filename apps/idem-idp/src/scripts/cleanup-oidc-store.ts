import { db } from '../db/client';
import { oidcStore } from '../db/schema/oidc';
import { inArray } from 'drizzle-orm';

async function cleanup() {
  console.log('🧹 Cleaning up old OIDC store entries...');

  try {
    const result = await db
      .delete(oidcStore)
      .where(
        inArray(oidcStore.name, [
          'AuthorizationCode',
          'Grant',
          'Session',
          'Interaction',
          'AccessToken',
          'RefreshToken',
        ])
      );

    console.log('✅ Deleted old OIDC store entries');
    console.log('   This will force a fresh OAuth flow');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
