# Incident Response Playbook — Idem Identity Provider

## Overview

This playbook provides step-by-step procedures for responding to security incidents in the Idem identity provider. Identity provider compromises are critical incidents that can affect all downstream applications and users.

**Emergency Contact:** [TO BE FILLED]
**On-Call Rotation:** [TO BE FILLED]
**PagerDuty/Opsgenie:** [TO BE FILLED]

---

## Incident Severity Levels

### Severity 1 (Critical) - Immediate Response Required
**Response Time:** < 15 minutes
**Escalation:** On-call engineer + Security team + Management

**Scenarios:**
- Private signing key compromise
- Database breach with PII exposure
- Mass unauthorized access to user accounts
- Complete service outage (all tenants)
- Upstream IdP compromise affecting authentication

### Severity 2 (High) - Urgent Response Required
**Response Time:** < 1 hour
**Escalation:** On-call engineer + Security team

**Scenarios:**
- Single tenant compromise
- Suspicious admin activity
- Rate limit bypass detected
- Token cleanup job failing for 48+ hours
- Abnormal authentication patterns (potential attack)

### Severity 3 (Medium) - Prompt Response Required
**Response Time:** < 4 hours
**Escalation:** On-call engineer

**Scenarios:**
- Individual account compromise
- Failed upstream IdP integration
- Performance degradation
- Audit log anomalies

### Severity 4 (Low) - Standard Response
**Response Time:** Next business day
**Escalation:** Engineering team

**Scenarios:**
- Configuration issues
- Non-critical monitoring alerts
- Documentation updates

---

## General Incident Response Process

### 1. Detection & Triage (First 5 Minutes)

**Acknowledge the Incident:**
```bash
# Acknowledge in PagerDuty/Opsgenie
# Post in #incidents Slack channel
Incident detected: [Brief description]
Severity: [1-4]
Assigned to: [Your name]
ETA for initial assessment: 15 minutes
```

**Initial Assessment:**
- What service/component is affected?
- What is the scope? (Single user, tenant, or system-wide?)
- Is user data at risk?
- Is the system currently under active attack?
- Are backups recent and accessible?

**Declare Incident:**
```bash
# Create incident document
/incident create [title]
# Start incident bridge/call if Severity 1 or 2
```

### 2. Containment (First 15-30 Minutes)

**Immediate Actions:**
1. **Isolate the affected component** (if possible without causing outage)
2. **Enable enhanced logging** for affected areas
3. **Preserve evidence** (logs, database snapshots, network captures)
4. **Notify stakeholders** (security team, management, affected customers)

**Do NOT:**
- ❌ Delete logs or evidence
- ❌ Reboot servers without preserving memory dumps (if forensics needed)
- ❌ Revoke all tokens without coordination (may cause total outage)

### 3. Investigation & Resolution

Follow scenario-specific playbooks below.

### 4. Recovery

- Verify the threat is neutralized
- Restore normal operations gradually
- Monitor for re-compromise

### 5. Post-Incident Review

- Document timeline of events
- Root cause analysis
- Update playbooks
- Implement preventive measures

---

## Scenario 1: Private Signing Key Compromise

### Severity: CRITICAL (Level 1)

**Indicators:**
- Private key file accessed by unauthorized user
- Key material found in logs or external location
- Suspicious tokens signed with our keys
- Alert: "Private key accessed outside secure context"

### Response Procedure

#### Phase 1: Immediate Containment (0-15 minutes)

1. **Confirm Compromise:**
```bash
# Check audit logs for key access
psql $DATABASE_URL -c "
SELECT * FROM idem_audit_log
WHERE action LIKE '%key%'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
"

# Check for suspicious key material in logs
grep -r "BEGIN PRIVATE KEY" /var/log/idem/
grep -r "private_jwk" /var/log/idem/
```

2. **Revoke Compromised Key:**
```bash
# Mark key as compromised in database
psql $DATABASE_URL -c "
UPDATE idem_keys
SET expires_at = NOW(),
    compromised = true,
    compromised_at = NOW()
WHERE kid = '<compromised-key-id>';
"
```

3. **Generate New Signing Key:**
```bash
# Run key rotation script (should be pre-prepared)
pnpm run keys:rotate --emergency

# Verify new key is active
curl https://idem.eventuras.com/.well-known/jwks.json
```

4. **Notify Downstream Services:**
```bash
# Send emergency notification to all OAuth clients
# They must refetch JWKS and re-validate tokens

# Example notification template:
cat <<EOF > /tmp/incident-notification.txt
SECURITY INCIDENT: Key Rotation

A security incident has required emergency rotation of our signing keys.

Action Required:
1. Refetch our JWKS from https://idem.eventuras.com/.well-known/jwks.json
2. Re-validate all cached tokens
3. Expect temporary authentication failures during transition

Timeline:
- Key rotated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Old key expires: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

Contact: security@eventuras.com
EOF

# Send via admin notification system
pnpm run admin:notify --all-clients --file /tmp/incident-notification.txt
```

#### Phase 2: Revoke Issued Tokens (15-30 minutes)

5. **Assess Token Exposure:**
```bash
# Find all tokens signed with compromised key
psql $DATABASE_URL -c "
SELECT name, COUNT(*) as count, MIN(created_at) as first, MAX(expires_at) as last
FROM idem_oidc_store
WHERE payload->>'kid' = '<compromised-key-id>'
GROUP BY name;
"
```

6. **Decision Point: Selective vs. Mass Revocation**

**Option A: Mass Revocation (Safest, but causes outage)**
```sql
-- Revoke ALL tokens signed with compromised key
UPDATE idem_oidc_store
SET consumed_at = NOW()
WHERE payload->>'kid' = '<compromised-key-id>'
AND consumed_at IS NULL;

-- Users must re-authenticate
```

**Option B: Selective Revocation (If compromise scope is known)**
```sql
-- Only revoke tokens issued to specific accounts
UPDATE idem_oidc_store
SET consumed_at = NOW()
WHERE account_id IN ('<account-1>', '<account-2>', ...)
AND consumed_at IS NULL;
```

#### Phase 3: Investigation (30 minutes - 4 hours)

7. **Determine Compromise Vector:**
- Check server access logs (who accessed the server?)
- Check application logs (was key logged accidentally?)
- Check backup logs (was backup compromised?)
- Check environment variable access (was master key leaked?)
- Interview team members (was key shared inappropriately?)

8. **Preserve Evidence:**
```bash
# Create forensic snapshot
mkdir -p /tmp/incident-$(date +%Y%m%d-%H%M%S)
cp -r /var/log/idem/ /tmp/incident-*/logs/
pg_dump $DATABASE_URL > /tmp/incident-*/database-snapshot.sql

# Compress and secure
tar -czf incident-evidence-$(date +%Y%m%d-%H%M%S).tar.gz /tmp/incident-*
chmod 400 incident-evidence-*.tar.gz
```

9. **Check for Malicious Activity:**
```sql
-- Look for suspicious token grants
SELECT
  account_id,
  client_id,
  COUNT(*) as token_count,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM idem_oidc_store
WHERE payload->>'kid' = '<compromised-key-id>'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY account_id, client_id
HAVING COUNT(*) > 100 -- Abnormally high
ORDER BY token_count DESC;
```

#### Phase 4: Recovery (4-8 hours)

10. **Verify Compromise is Contained:**
- [ ] New key is active and in JWKS
- [ ] Old key is expired and marked as compromised
- [ ] Compromised key is removed from all servers
- [ ] All downstream services notified
- [ ] Tokens revoked (if necessary)

11. **Monitor for Re-Compromise:**
```bash
# Watch for suspicious key access
tail -f /var/log/idem/audit.log | grep "key"

# Monitor token issuance rate
watch -n 5 'psql $DATABASE_URL -c "SELECT COUNT(*) FROM idem_oidc_store WHERE created_at > NOW() - INTERVAL '\''5 minutes'\'';"'
```

12. **Communication Plan:**
- Internal: Update incident channel with status
- Customers: If tokens revoked, notify affected users
- Public: If legally required (GDPR breach notification)

#### Phase 5: Post-Incident (1-2 weeks)

13. **Root Cause Analysis:**
- Document how key was compromised
- Document timeline of detection and response
- Identify failures in detection/prevention

14. **Preventive Measures:**
- [ ] Migrate to KMS (if not already done)
- [ ] Improve key access logging
- [ ] Implement key access anomaly detection
- [ ] Update key rotation runbook
- [ ] Conduct key rotation drill (quarterly)
- [ ] Review and restrict key access permissions

---

## Scenario 2: Database Breach

### Severity: CRITICAL (Level 1)

**Indicators:**
- Unauthorized database access detected
- Database credentials found in public location
- Unusual database queries in logs
- Data exfiltration detected

### Response Procedure

#### Phase 1: Immediate Containment (0-15 minutes)

1. **Verify Breach:**
```bash
# Check PostgreSQL logs for suspicious activity
tail -n 1000 /var/log/postgresql/postgresql-*.log | grep -E "(FATAL|ERROR|unauthorized)"

# Check active connections
psql $DATABASE_URL -c "
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  backend_start,
  state,
  query
FROM pg_stat_activity
WHERE datname = 'idem'
ORDER BY backend_start DESC;
"
```

2. **Kill Suspicious Connections:**
```sql
-- Kill active sessions from unauthorized IPs
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE client_addr NOT IN ('<allowed-ip-1>', '<allowed-ip-2>')
AND datname = 'idem';
```

3. **Rotate Database Credentials (IMMEDIATELY):**
```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update database user password
psql $DATABASE_URL -c "
ALTER USER idem_user PASSWORD '$NEW_PASSWORD';
"

# Update application config (via secret manager)
aws secretsmanager update-secret \
  --secret-id idem/database/password \
  --secret-string "$NEW_PASSWORD"

# Restart application to pickup new credentials
kubectl rollout restart deployment/idem-api
```

4. **Enable Database Firewall (if available):**
```bash
# Restrict database access to application servers only
# (Cloud provider specific - example for AWS RDS)
aws rds modify-db-instance \
  --db-instance-identifier idem-prod \
  --vpc-security-group-ids sg-application-only
```

#### Phase 2: Assess Damage (15-60 minutes)

5. **Determine What Was Accessed:**
```sql
-- Check PostgreSQL audit logs (if pg_audit enabled)
SELECT * FROM pg_audit.logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Check for suspicious data access patterns
SELECT
  usename,
  COUNT(*) as query_count,
  array_agg(DISTINCT query_type) as query_types
FROM pg_stat_statements
WHERE calls > 1000 -- Abnormally high
GROUP BY usename;
```

6. **Identify Compromised Data:**
```sql
-- Check if PII tables accessed
SELECT
  schemaname,
  tablename,
  n_tup_ins + n_tup_upd + n_tup_del as modifications,
  seq_scan + idx_scan as reads
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND tablename IN (
  'idem_accounts',
  'idem_identities',
  'idem_emails',
  'idem_profile_person',
  'idem_oauth_clients',
  'idem_keys'
)
ORDER BY reads DESC;
```

7. **Determine if Secrets Exposed:**
- Client secrets (hashed with bcrypt - safe)
- Private keys (encrypted - depends on master key compromise)
- IdP broker secrets (encrypted - depends on master key compromise)
- Master encryption key (environment variable - check server access logs)

#### Phase 3: Containment & Recovery (1-4 hours)

8. **If Master Key Compromised:**
```bash
# CRITICAL: Follow Scenario 1 (Key Compromise) immediately
# This is now a double-breach (database + keys)

# Emergency actions:
# 1. Rotate all encryption keys
# 2. Re-encrypt all private keys with new master key
# 3. Revoke all tokens
# 4. Force re-authentication of all users
```

9. **If PII Exposed:**
```bash
# Legal obligation: GDPR breach notification (within 72 hours)
# Contact: legal@eventuras.com + DPO

# Document exposure:
cat <<EOF > /tmp/breach-report.txt
Data Breach Report

Date of breach: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Date of discovery: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Affected records: [TO BE DETERMINED]
Data types exposed: [email, name, national_id, etc.]
Attack vector: [SQL injection, credential theft, etc.]
Containment measures: [Database credentials rotated, firewall updated]
EOF
```

10. **Forensic Investigation:**
```bash
# Preserve database state
pg_dump $DATABASE_URL > /tmp/breach-snapshot-$(date +%Y%m%d).sql

# Analyze queries (if pg_stat_statements enabled)
psql $DATABASE_URL -c "
COPY (
  SELECT * FROM pg_stat_statements
  WHERE calls > 100
  ORDER BY calls DESC
) TO '/tmp/suspicious-queries.csv' CSV HEADER;
"

# Check for SQL injection attempts
grep -r "UNION SELECT\|DROP TABLE\|; --" /var/log/idem/
```

#### Phase 4: User Notification (4-72 hours)

11. **If User Data Compromised:**
- **Within 72 hours:** Notify data protection authority (GDPR requirement)
- **Without undue delay:** Notify affected users
- **Immediately:** Post security advisory on status page

**Email Template:**
```text
Subject: Security Incident Notification

Dear [User],

We are writing to inform you of a security incident that may have affected your Idem account.

What happened:
On [date], we detected unauthorized access to our database. [Brief description].

What data was affected:
[List specific data types: email, name, etc.]

What we are doing:
- We have secured the database and rotated all credentials
- We have engaged external security experts to investigate
- We are implementing additional security measures

What you should do:
1. Change your password at https://idem.eventuras.com/change-password
2. Review your account activity for suspicious behavior
3. Enable multi-factor authentication (if available)
4. Monitor for phishing attempts using your exposed information

Contact:
If you have questions, contact security@eventuras.com

We sincerely apologize for this incident.

[Name]
Security Team, Eventuras
```

#### Phase 5: Hardening (1-2 weeks)

12. **Implement Additional Security Measures:**
- [ ] Enable PostgreSQL audit logging (pg_audit)
- [ ] Implement database activity monitoring (DAM)
- [ ] Enable query logging for suspicious patterns
- [ ] Implement IP whitelisting at database level
- [ ] Use IAM authentication instead of passwords (if cloud provider supports)
- [ ] Enable encryption at rest (if not already enabled)
- [ ] Implement row-level security policies
- [ ] Regular penetration testing

---

## Scenario 3: Upstream IdP Compromise

### Severity: HIGH (Level 2)

**Indicators:**
- Upstream IdP (Vipps, HelseID, etc.) reports security incident
- Suspicious authentication patterns from specific IdP
- Invalid tokens from upstream IdP
- Mass unauthorized access via specific IdP

### Response Procedure

#### Phase 1: Immediate Containment (0-30 minutes)

1. **Verify Incident:**
```bash
# Check for alerts from upstream IdP
# Vipps: security@vipps.no
# HelseID: https://www.nhn.no/kontakt-oss/
# ID-porten: kontakt@digdir.no

# Check audit logs for suspicious activity
psql $DATABASE_URL -c "
SELECT
  provider,
  COUNT(*) as auth_count,
  COUNT(DISTINCT account_id) as unique_users
FROM idem_identities
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY provider
ORDER BY auth_count DESC;
"
```

2. **Disable Affected IdP (Temporary):**
```sql
-- Disable IdP provider for all tenants
UPDATE idem_idp_provider_tenants
SET enabled = false
WHERE provider_id = (
  SELECT id FROM idem_idp_providers
  WHERE key = '<compromised-provider>'
);
```

3. **Notify Users:**
```bash
# Post status update
# "[IdP Name] authentication is temporarily disabled due to a security incident. We are investigating."
```

#### Phase 2: Investigation (30 minutes - 4 hours)

4. **Assess Impact:**
```sql
-- Find accounts using compromised IdP
SELECT
  a.id,
  a.primary_email,
  i.provider,
  i.created_at,
  a.last_login_at
FROM idem_accounts a
JOIN idem_identities i ON i.account_id = a.id
WHERE i.provider = '<compromised-provider>'
ORDER BY a.last_login_at DESC;
```

5. **Check for Token Misuse:**
```sql
-- Look for suspicious token grants via compromised IdP
SELECT
  os.client_id,
  os.account_id,
  COUNT(*) as token_count,
  MIN(os.created_at) as first_seen,
  MAX(os.created_at) as last_seen
FROM idem_oidc_store os
JOIN idem_identities i ON i.account_id = os.account_id
WHERE i.provider = '<compromised-provider>'
AND os.created_at > NOW() - INTERVAL '7 days'
GROUP BY os.client_id, os.account_id
HAVING COUNT(*) > 100 -- Abnormally high
ORDER BY token_count DESC;
```

#### Phase 3: Recovery (4-24 hours)

6. **Wait for IdP Resolution:**
- Monitor IdP status page
- Coordinate with IdP support team
- Verify IdP has published incident report

7. **Re-enable IdP (When Safe):**
```sql
-- Re-enable after IdP confirms security
UPDATE idem_idp_provider_tenants
SET enabled = true,
    last_error_at = NULL,
    last_error_code = NULL,
    last_error_message = NULL,
    consecutive_errors = 0
WHERE provider_id = (
  SELECT id FROM idem_idp_providers
  WHERE key = '<compromised-provider>'
);
```

8. **Force Re-authentication (If Required):**
```sql
-- Revoke all sessions for users authenticated via compromised IdP
UPDATE idem_oidc_store
SET consumed_at = NOW()
WHERE account_id IN (
  SELECT account_id FROM idem_identities
  WHERE provider = '<compromised-provider>'
)
AND consumed_at IS NULL;
```

9. **Monitor for Abnormal Activity:**
```bash
# Watch authentication patterns
watch -n 10 'psql $DATABASE_URL -c "
SELECT
  provider,
  COUNT(*) as auth_last_10min
FROM idem_identities
WHERE created_at > NOW() - INTERVAL '\''10 minutes'\''
GROUP BY provider;
"'
```

#### Phase 4: Post-Incident

10. **Document Incident:**
- Timeline of upstream IdP incident
- Impact on Idem users
- Response actions taken
- Recovery timeline

11. **Review IdP Contract:**
- Does IdP have incident notification SLA?
- Should we implement backup authentication methods?
- Consider multi-IdP strategy for critical tenants

---

## Scenario 4: Mass Token Revocation

### Severity: HIGH (Level 2)

**Trigger Scenarios:**
- Security patch requires immediate token invalidation
- Mass account compromise detected
- Emergency maintenance requiring re-authentication

### Response Procedure

#### Phase 1: Preparation (Before Revocation)

1. **Assess Impact:**
```sql
-- Count active tokens
SELECT
  name,
  COUNT(*) as count,
  COUNT(DISTINCT account_id) as unique_users,
  COUNT(DISTINCT client_id) as unique_clients
FROM idem_oidc_store
WHERE consumed_at IS NULL
AND expires_at > NOW()
GROUP BY name;
```

2. **Notify Stakeholders:**
```bash
# Send 30-minute warning to all OAuth clients
# "Emergency maintenance in 30 minutes. All users will need to re-authenticate."
```

#### Phase 2: Revocation

3. **Revoke Tokens:**
```sql
-- Revoke ALL active tokens/sessions
UPDATE idem_oidc_store
SET consumed_at = NOW()
WHERE consumed_at IS NULL
AND expires_at > NOW();

-- Verify revocation
SELECT COUNT(*) FROM idem_oidc_store
WHERE consumed_at IS NULL AND expires_at > NOW();
-- Should return 0
```

#### Phase 3: Recovery

4. **Monitor Re-authentication:**
```bash
# Watch for authentication rate
watch -n 5 'psql $DATABASE_URL -c "
SELECT COUNT(*) FROM idem_oidc_store
WHERE name = '\''Session'\''
AND created_at > NOW() - INTERVAL '\''5 minutes'\'';
"'

# Alert if authentication rate too high (DoS protection)
```

---

## Emergency Contacts

### Internal
- **On-Call Engineer:** [PHONE/SLACK]
- **Security Team Lead:** [PHONE/EMAIL]
- **CTO:** [PHONE/EMAIL]
- **Legal/DPO:** [EMAIL]

### External
- **Database Provider Support:** [CONTACT]
- **Hosting Provider Support:** [CONTACT]
- **Vipps Security:** security@vipps.no
- **HelseID Support:** https://www.nhn.no/kontakt-oss/
- **ID-porten Support:** kontakt@digdir.no

### Compliance
- **Data Protection Authority (Norway):** https://www.datatilsynet.no/
- **Email:** postkasse@datatilsynet.no
- **Phone:** +47 22 39 69 00

---

## Post-Incident Checklist

After ANY security incident:

- [ ] Incident timeline documented
- [ ] Root cause identified
- [ ] Evidence preserved
- [ ] Stakeholders notified
- [ ] Users notified (if required)
- [ ] Regulatory notification (if required)
- [ ] Playbook updated with lessons learned
- [ ] Preventive measures implemented
- [ ] Post-incident review meeting scheduled
- [ ] Runbook improvements identified

---

## Drills and Testing

**Quarterly Drills:**
- [ ] Key rotation drill
- [ ] Database credential rotation drill
- [ ] Mass token revocation drill
- [ ] Upstream IdP failure simulation

**Annual Testing:**
- [ ] Full incident response simulation (tabletop exercise)
- [ ] Penetration testing
- [ ] Disaster recovery test

---

## Version History

- **v1.0 (2026-01-19):** Initial playbook creation
- **v1.1 (TBD):** Post-incident updates

**Last Reviewed:** 2026-01-19
**Next Review:** 2026-04-19 (quarterly)
