import { db } from '../db/client';
import { oidcStore } from '../db/schema/oidc';
import { eq, desc } from 'drizzle-orm';

async function check() {
  console.log('🔍 Checking OIDC store...\n');

  try {
    // Check AuthorizationCode entries
    const codes = await db
      .select()
      .from(oidcStore)
      .where(eq(oidcStore.name, 'AuthorizationCode'))
      .orderBy(desc(oidcStore.createdAt));

    console.log(`Authorization Codes: ${codes.length}`);
    for (const code of codes) {
      const payload = code.payload as any;
      console.log(`  - oidcId: ${code.oidcId}`);
      console.log(`    clientId: ${code.clientId}`);
      console.log(`    expiresAt: ${code.expiresAt}`);
      console.log(`    consumedAt: ${code.consumedAt}`);
      if (payload?.params?.iss) {
        console.log(`    issuer in payload: ${payload.params.iss}`);
      }
      console.log('');
    }

    // Check Interaction entries
    const interactions = await db
      .select()
      .from(oidcStore)
      .where(eq(oidcStore.name, 'Interaction'))
      .orderBy(desc(oidcStore.createdAt));

    console.log(`Interactions: ${interactions.length}`);
    for (const interaction of interactions) {
      console.log(`  - oidcId: ${interaction.oidcId}`);
      console.log(`    uid: ${interaction.uid}`);
      console.log(`    expiresAt: ${interaction.expiresAt}`);
      console.log('');
    }

    // Check all entries
    const all = await db
      .select()
      .from(oidcStore)
      .orderBy(desc(oidcStore.createdAt));

    console.log(`\nTotal entries: ${all.length}`);
    const byType = all.reduce((acc, entry) => {
      acc[entry.name] = (acc[entry.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('By type:');
    for (const [name, count] of Object.entries(byType)) {
      console.log(`  ${name}: ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

check();
