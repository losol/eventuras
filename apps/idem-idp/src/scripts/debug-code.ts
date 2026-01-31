import { db } from '../db/client';
import { oidcStore } from '../db/schema/oidc';
import { eq, desc } from 'drizzle-orm';

async function debugCode() {
  const [code] = await db
    .select()
    .from(oidcStore)
    .where(eq(oidcStore.name, 'AuthorizationCode'))
    .orderBy(desc(oidcStore.createdAt))
    .limit(1);

  if (!code) {
    console.log('No authorization codes found');
    process.exit(0);
  }

  console.log('Most recent authorization code:');
  console.log('oidcId:', code.oidcId);
  console.log('clientId:', code.clientId);
  console.log('grantId:', code.grantId);
  console.log('sessionId:', code.sessionId);
  console.log('accountId:', code.accountId);

  const payload = code.payload as any;
  const now = Math.floor(Date.now() / 1000);

  console.log('\n=== VERIFY DEBUG (opaque.js checks) ===');
  console.log('Has "jwt" property:', 'jwt' in payload);
  console.log('Has "jwt-ietf" property:', 'jwt-ietf' in payload);
  console.log('Has "paseto" property:', 'paseto' in payload);
  console.log('Has "format" property:', 'format' in payload);
  console.log('Format value:', payload?.format);
  console.log('Format is "opaque":', payload?.format === 'opaque');

  console.log('\n=== TIME VALIDATION (assertPayload checks) ===');
  console.log('exp:', payload?.exp, '| type:', typeof payload?.exp);
  console.log('iat:', payload?.iat, '| type:', typeof payload?.iat);
  console.log('now (unix):', now);
  console.log('exp > now (valid):', payload?.exp > now);
  console.log('iat <= now (valid):', payload?.iat <= now);
  console.log('Time until expiration:', payload?.exp - now, 'seconds');

  console.log('\n=== ALL PAYLOAD KEYS ===');
  console.log(Object.keys(payload));

  console.log('\n=== FULL PAYLOAD (truncated) ===');
  const payloadStr = JSON.stringify(payload, null, 2);
  console.log(payloadStr.length > 2000 ? payloadStr.substring(0, 2000) + '...' : payloadStr);

  console.log('\nPayload:');
  console.log('- grantId:', payload?.grantId);
  console.log('- accountId:', payload?.accountId);
  console.log('- clientId:', payload?.clientId);
  console.log('- redirectUri:', payload?.redirectUri);
  console.log('- codeChallenge:', payload?.codeChallenge);
  console.log('- codeChallengeMethod:', payload?.codeChallengeMethod);

  // Check if Grant exists
  if (code.grantId) {
    const [grant] = await db
      .select()
      .from(oidcStore)
      .where(eq(oidcStore.oidcId, `Grant:${code.grantId}`))
      .limit(1);

    console.log('\nGrant exists:', !!grant);
    if (grant) {
      console.log('Grant details:');
      console.log('- oidcId:', grant.oidcId);
      console.log('- clientId:', grant.clientId);
      console.log('- accountId:', grant.accountId);
      const grantPayload = grant.payload as any;
      console.log('- scopes:', grantPayload?.openid?.scope);
    }
  } else {
    console.log('\n❌ No grantId in authorization code - this is the problem!');
  }

  // Check if SESSION exists (CRITICAL for isSessionBound mixin!)
  console.log('\n=== SESSION CHECK (isSessionBound mixin) ===');
  console.log('expiresWithSession:', payload?.expiresWithSession);
  console.log('sessionUid:', payload?.sessionUid);

  if (payload?.sessionUid) {
    // oidc-provider uses Session.findByUid which calls adapter.findByUid
    // Let's check if the session exists
    const [session] = await db
      .select()
      .from(oidcStore)
      .where(eq(oidcStore.oidcId, `Session:${payload.sessionUid}`))
      .limit(1);

    console.log('Session exists (by oidcId):', !!session);

    // Also check by uid field (findByUid looks up by uid column)
    const [sessionByUid] = await db
      .select()
      .from(oidcStore)
      .where(eq(oidcStore.uid, payload.sessionUid))
      .limit(1);

    console.log('Session exists (by uid column):', !!sessionByUid);

    if (session) {
      console.log('Session details:');
      console.log('- oidcId:', session.oidcId);
      console.log('- accountId:', session.accountId);
      const sessionPayload = session.payload as any;
      console.log('- payload.accountId:', sessionPayload?.accountId);
      console.log('- payload keys:', Object.keys(sessionPayload));
      console.log('- Session matches token accountId:', session.accountId === payload.accountId);
    }

    if (sessionByUid && !session) {
      console.log('Session by uid details:');
      console.log('- oidcId:', sessionByUid.oidcId);
      console.log('- uid:', sessionByUid.uid);
      console.log('- name:', sessionByUid.name);
    }

    if (!session && !sessionByUid) {
      console.log('\n❌ SESSION NOT FOUND - This is why the authorization code is rejected!');
      console.log('The isSessionBound mixin requires the session to exist when expiresWithSession=true');
    }
  }

  // List all sessions in the store
  console.log('\n=== ALL SESSIONS IN STORE ===');
  const allSessions = await db
    .select()
    .from(oidcStore)
    .where(eq(oidcStore.name, 'Session'));

  console.log('Total sessions:', allSessions.length);
  for (const s of allSessions) {
    const sessionId = s.oidcId.replace('Session:', '');
    const matchesAuthCode = sessionId === payload?.sessionUid;
    console.log(`  - oidcId: ${sessionId.substring(0, 20)}..., uid: ${s.uid ? s.uid.substring(0, 20) + '...' : 'NULL'}, matches: ${matchesAuthCode ? 'YES!' : 'no'}`);
  }

  // Search ALL records for the target sessionUid
  if (payload?.sessionUid) {
    console.log('\n=== SEARCHING ALL RECORDS FOR sessionUid ===');
    const targetId = payload.sessionUid;
    const allRecords = await db.select().from(oidcStore);
    console.log('Total records in OIDC store:', allRecords.length);

    let found = false;
    for (const r of allRecords) {
      if (r.oidcId.includes(targetId) || r.uid === targetId || r.sessionId === targetId) {
        console.log('FOUND in record:', r.name, r.oidcId.substring(0, 40));
        found = true;
      }
    }
    if (!found) {
      console.log('❌ sessionUid NOT FOUND anywhere in the OIDC store!');
      console.log('This session was never created or was already deleted.');
    }

    // List all entity types
    const types = [...new Set(allRecords.map(r => r.name))];
    console.log('\nEntity types in store:', types.join(', '));

    // List Interactions (might be related to the session)
    const interactions = allRecords.filter(r => r.name === 'Interaction');
    console.log('\nInteractions:', interactions.length);
    for (const i of interactions) {
      console.log(`  - ${i.oidcId.substring(12, 32)}..., uid: ${i.uid ? i.uid.substring(0, 20) + '...' : 'NULL'}`);
    }
  }

  // Check if the session might exist by oidcId but not by uid
  if (payload?.sessionUid) {
    const targetOidcId = `Session:${payload.sessionUid}`;
    const [sessionByOidcId] = await db
      .select()
      .from(oidcStore)
      .where(eq(oidcStore.oidcId, targetOidcId))
      .limit(1);

    console.log('\n=== DIRECT SESSION LOOKUP ===');
    console.log(`Looking for oidcId: ${targetOidcId.substring(0, 40)}...`);
    console.log('Found by oidcId:', sessionByOidcId ? 'YES' : 'NO');
    if (sessionByOidcId) {
      console.log('  uid column value:', sessionByOidcId.uid || 'NULL');
      console.log('  This session exists but uid is not populated - fix needed in adapter!');
    }
  }

  process.exit(0);
}

debugCode();
