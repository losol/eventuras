import { db } from '../db/client';
import { oidcStore } from '../db/schema/oidc';
import { eq } from 'drizzle-orm';

async function checkCode() {
  const codeId = 'AuthorizationCode:MpkjmoMidxd2_30bmsbXWmJMh6_fpbsb9-vnVtMJtin';
  const [code] = await db.select().from(oidcStore).where(eq(oidcStore.oidcId, codeId));

  if (!code) {
    console.log('❌ Authorization code NOT FOUND in database');
    console.log('This means the code was either:');
    console.log('1. Never created');
    console.log('2. Already consumed and deleted');
    console.log('3. Expired and cleaned up');
    process.exit(0);
  }

  console.log('✅ Code found!');
  console.log('consumedAt:', code.consumedAt);
  console.log('expiresAt:', code.expiresAt);
  console.log('grantId:', code.grantId);
  console.log('createdAt:', code.createdAt);

  const payload = code.payload as any;
  console.log('\nPayload details:');
  console.log('- redirectUri:', payload.redirectUri);
  console.log('- codeChallenge:', payload.codeChallenge);
  console.log('- codeChallengeMethod:', payload.codeChallengeMethod);

  if (code.grantId) {
    const [grant] = await db.select().from(oidcStore)
      .where(eq(oidcStore.oidcId, `Grant:${code.grantId}`));
    console.log('\nGrant exists:', !!grant);
  }

  process.exit(0);
}

checkCode();
