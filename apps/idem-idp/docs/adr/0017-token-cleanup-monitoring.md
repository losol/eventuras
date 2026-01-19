# ADR 0017 — Token Cleanup Job and Monitoring

## Status
Accepted

## Context
The `idem_oidc_store` table stores all OIDC tokens, authorization codes, sessions, and PAR requests. Without proper cleanup, this table will grow unbounded, leading to:
- Degraded query performance (slower logins, token exchanges)
- Increased storage costs
- Higher backup/restore times
- Potential database capacity issues

The cleanup job is critical infrastructure that must be:
- Reliable (runs consistently, handles errors gracefully)
- Monitored (failures detected immediately)
- Testable (can verify correct behavior)
- Safe (doesn't delete active tokens/sessions)

## Decision

### 1. Cleanup Job Implementation

**Two-Phase Cleanup Strategy:**
1. **Soft Delete**: Mark tokens as consumed/expired (keeps audit trail)
2. **Hard Delete**: Remove old records after retention period

**Cleanup Job (Daily):**
```typescript
// server/jobs/token-cleanup.ts
import cron from 'node-cron';
import { db } from '@idem/db';
import { oidcStore } from '@idem/db/schema';
import { and, or, lt, isNotNull, isNull, sql } from 'drizzle-orm';
import { logger } from '../logger';
import { sendAlert } from '../alerting';

interface CleanupResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  recordsDeleted: number;
  errors: string[];
  tableSizeAfter: number;
}

export async function runTokenCleanup(): Promise<CleanupResult> {
  const startTime = new Date();
  const errors: string[] = [];
  let recordsDeleted = 0;

  logger.info('Starting token cleanup job');

  try {
    // 1. Delete expired and consumed tokens (keep for 7 days after consumption)
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleteResult = await db.delete(oidcStore)
      .where(
        or(
          // Expired tokens (never consumed)
          and(
            lt(oidcStore.expires_at, new Date()),
            isNull(oidcStore.consumed_at)
          ),
          // Consumed tokens older than 7 days
          and(
            isNotNull(oidcStore.consumed_at),
            lt(oidcStore.consumed_at, cutoffDate)
          )
        )
      );

    recordsDeleted = deleteResult.rowCount || 0;

    logger.info({ recordsDeleted }, 'Token cleanup: records deleted');

    // 2. Check table size after cleanup
    const sizeResult = await db.execute(sql`
      SELECT COUNT(*) as count,
             pg_size_pretty(pg_total_relation_size('idem_oidc_store')) as size
      FROM idem_oidc_store
    `);

    const tableCount = parseInt(sizeResult.rows[0].count);
    const tableSize = sizeResult.rows[0].size;

    logger.info({
      tableCount,
      tableSize,
    }, 'Token cleanup: table metrics');

    // 3. Alert if table size exceeds thresholds
    if (tableCount > 1_000_000) {
      const error = `CRITICAL: oidc_store table exceeds 1M records (${tableCount})`;
      errors.push(error);
      logger.error({ tableCount }, error);

      await sendAlert({
        severity: 'critical',
        title: 'OIDC Store Table Size Critical',
        message: `Table has ${tableCount.toLocaleString()} records. Immediate action required.`,
        tags: ['token-cleanup', 'database', 'critical'],
      });
    } else if (tableCount > 500_000) {
      const warning = `WARNING: oidc_store table exceeds 500K records (${tableCount})`;
      errors.push(warning);
      logger.warn({ tableCount }, warning);

      await sendAlert({
        severity: 'warning',
        title: 'OIDC Store Table Size High',
        message: `Table has ${tableCount.toLocaleString()} records. Monitor closely.`,
        tags: ['token-cleanup', 'database', 'warning'],
      });
    }

    // 4. Analyze table for query optimization (weekly, on Sunday)
    if (new Date().getDay() === 0) {
      logger.info('Running ANALYZE on idem_oidc_store');
      await db.execute(sql`ANALYZE idem_oidc_store`);
    }

    // 5. Record successful completion
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    await recordCleanupRun({
      success: true,
      recordsDeleted,
      tableCount,
      duration,
      completedAt: endTime,
    });

    logger.info({
      recordsDeleted,
      tableCount,
      duration,
    }, 'Token cleanup completed successfully');

    return {
      success: true,
      startTime,
      endTime,
      duration,
      recordsDeleted,
      errors,
      tableSizeAfter: tableCount,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);

    logger.error({ error }, 'Token cleanup job failed');

    // Alert on failure
    await sendAlert({
      severity: 'error',
      title: 'Token Cleanup Job Failed',
      message: `Cleanup job failed: ${errorMessage}`,
      tags: ['token-cleanup', 'database', 'error'],
    });

    // Record failed run
    await recordCleanupRun({
      success: false,
      recordsDeleted: 0,
      tableCount: null,
      duration: Date.now() - startTime.getTime(),
      completedAt: new Date(),
      error: errorMessage,
    });

    return {
      success: false,
      startTime,
      endTime: new Date(),
      duration: Date.now() - startTime.getTime(),
      recordsDeleted,
      errors,
      tableSizeAfter: 0,
    };
  }
}

// Schedule job to run daily at 2 AM
export function scheduleTokenCleanup() {
  // Run at 2 AM daily
  cron.schedule('0 2 * * *', async () => {
    await runTokenCleanup();
  });

  logger.info('Token cleanup job scheduled (daily at 2 AM)');
}

// Record cleanup run for monitoring
async function recordCleanupRun(run: {
  success: boolean;
  recordsDeleted: number;
  tableCount: number | null;
  duration: number;
  completedAt: Date;
  error?: string;
}) {
  await db.insert(cleanupRuns).values({
    job_name: 'token_cleanup',
    success: run.success,
    records_deleted: run.recordsDeleted,
    table_count: run.tableCount,
    duration_ms: run.duration,
    completed_at: run.completedAt,
    error: run.error,
  });
}
```

### 2. Cleanup Runs Tracking Table

**Database Schema:**
```sql
CREATE TABLE idem_cleanup_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  records_deleted INT NOT NULL DEFAULT 0,
  table_count INT,
  duration_ms INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cleanup_runs_job ON idem_cleanup_runs(job_name, completed_at DESC);
CREATE INDEX idx_cleanup_runs_success ON idem_cleanup_runs(job_name, success);
```

### 3. Health Monitoring

**Health Check Endpoint:**
```typescript
// server/routes/health.ts
app.get('/healthz', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    checks: {
      database: 'ok',
      tokenCleanup: 'ok',
    },
    details: {},
  };

  try {
    // 1. Check database connectivity
    await db.execute(sql`SELECT 1`);

    // 2. Check last cleanup run
    const lastRun = await db.query.cleanupRuns.findFirst({
      where: eq(cleanupRuns.job_name, 'token_cleanup'),
      orderBy: [desc(cleanupRuns.completed_at)],
    });

    if (!lastRun) {
      health.checks.tokenCleanup = 'warning';
      health.details.tokenCleanup = 'No cleanup runs recorded';
      health.status = 'degraded';
    } else {
      const hoursSinceLastRun = (Date.now() - lastRun.completed_at.getTime()) / (1000 * 60 * 60);

      // Alert if cleanup hasn't run in 36 hours (should run daily)
      if (hoursSinceLastRun > 36) {
        health.checks.tokenCleanup = 'error';
        health.details.tokenCleanup = `Last run was ${Math.round(hoursSinceLastRun)} hours ago`;
        health.status = 'unhealthy';
      } else if (!lastRun.success) {
        health.checks.tokenCleanup = 'error';
        health.details.tokenCleanup = `Last run failed: ${lastRun.error}`;
        health.status = 'unhealthy';
      } else {
        health.details.tokenCleanup = {
          lastRun: lastRun.completed_at,
          recordsDeleted: lastRun.records_deleted,
          tableCount: lastRun.table_count,
          duration: `${lastRun.duration_ms}ms`,
        };
      }
    }

    // 3. Check table size
    const tableSize = await db.execute(sql`
      SELECT COUNT(*) as count FROM idem_oidc_store
    `);
    const count = parseInt(tableSize.rows[0].count);

    health.details.oidcStore = {
      recordCount: count,
      threshold: count > 500_000 ? 'warning' : 'ok',
    };

    if (count > 1_000_000) {
      health.status = 'unhealthy';
      health.checks.database = 'error';
    }

  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = 'error';
    health.details.error = error instanceof Error ? error.message : String(error);
  }

  const statusCode = health.status === 'ok' ? 200 :
                     health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});
```

### 4. Metrics and Dashboards

**Prometheus Metrics:**
```typescript
// server/metrics.ts
import { Counter, Gauge, Histogram } from 'prom-client';

export const tokenCleanupMetrics = {
  // Count of cleanup runs
  runsTotal: new Counter({
    name: 'idem_token_cleanup_runs_total',
    help: 'Total number of token cleanup runs',
    labelNames: ['success'],
  }),

  // Records deleted per run
  recordsDeleted: new Gauge({
    name: 'idem_token_cleanup_records_deleted',
    help: 'Number of records deleted in last cleanup run',
  }),

  // Table size after cleanup
  tableSize: new Gauge({
    name: 'idem_oidc_store_size',
    help: 'Number of records in idem_oidc_store table',
  }),

  // Cleanup duration
  duration: new Histogram({
    name: 'idem_token_cleanup_duration_seconds',
    help: 'Duration of token cleanup job in seconds',
    buckets: [1, 5, 10, 30, 60, 120, 300],
  }),

  // Hours since last successful run
  lastSuccessAge: new Gauge({
    name: 'idem_token_cleanup_last_success_age_hours',
    help: 'Hours since last successful cleanup run',
  }),
};

// Update metrics after each cleanup run
export function updateCleanupMetrics(result: CleanupResult) {
  tokenCleanupMetrics.runsTotal.inc({ success: result.success ? 'true' : 'false' });
  tokenCleanupMetrics.recordsDeleted.set(result.recordsDeleted);
  tokenCleanupMetrics.tableSize.set(result.tableSizeAfter);
  tokenCleanupMetrics.duration.observe(result.duration / 1000);
  tokenCleanupMetrics.lastSuccessAge.set(0); // Reset on success
}
```

**Grafana Dashboard Panels:**
```yaml
Dashboard: "Idem Token Cleanup"

Panels:
  - Title: "Cleanup Runs (24h)"
    Query: "rate(idem_token_cleanup_runs_total[24h])"
    Type: Graph
    Alert: "< 0.04 (less than 1 run per 24h)"

  - Title: "Records Deleted per Run"
    Query: "idem_token_cleanup_records_deleted"
    Type: Graph

  - Title: "OIDC Store Table Size"
    Query: "idem_oidc_store_size"
    Type: Gauge
    Thresholds:
      - 500000: "warning"
      - 1000000: "critical"

  - Title: "Cleanup Duration"
    Query: "histogram_quantile(0.95, idem_token_cleanup_duration_seconds)"
    Type: Graph
    Alert: "> 300s (5 minutes)"

  - Title: "Hours Since Last Success"
    Query: "idem_token_cleanup_last_success_age_hours"
    Type: Gauge
    Alert: "> 36 hours"

  - Title: "Cleanup Failure Rate (7d)"
    Query: "rate(idem_token_cleanup_runs_total{success='false'}[7d])"
    Type: Stat
    Alert: "> 0.1 (10% failure rate)"
```

### 5. Alerting Rules

**Critical Alerts (PagerDuty / Opsgenie):**
```yaml
# Cleanup hasn't run in 36 hours
- alert: TokenCleanupStale
  expr: idem_token_cleanup_last_success_age_hours > 36
  for: 10m
  severity: critical
  annotations:
    summary: "Token cleanup job hasn't run in {{ $value }} hours"
    description: "Immediate investigation required. Table may be growing unbounded."

# Table size exceeds 1M records
- alert: OidcStoreTableCritical
  expr: idem_oidc_store_size > 1000000
  for: 5m
  severity: critical
  annotations:
    summary: "OIDC store table exceeds 1M records"
    description: "Table has {{ $value }} records. Performance degradation likely."

# Cleanup job consistently failing
- alert: TokenCleanupFailureRate
  expr: rate(idem_token_cleanup_runs_total{success="false"}[1h]) > 0.5
  for: 30m
  severity: critical
  annotations:
    summary: "Token cleanup job failing consistently"
    description: "More than 50% of cleanup runs failed in the last hour."
```

**Warning Alerts (Slack / Email):**
```yaml
# Table size approaching threshold
- alert: OidcStoreTableHigh
  expr: idem_oidc_store_size > 500000
  for: 15m
  severity: warning
  annotations:
    summary: "OIDC store table exceeds 500K records"
    description: "Table has {{ $value }} records. Monitor closely."

# Cleanup duration increasing
- alert: TokenCleanupSlow
  expr: histogram_quantile(0.95, idem_token_cleanup_duration_seconds) > 300
  for: 30m
  severity: warning
  annotations:
    summary: "Token cleanup job taking > 5 minutes"
    description: "Cleanup duration: {{ $value }}s. May indicate performance issues."

# Records deleted per run increasing
- alert: TokenCleanupHighDeletion
  expr: idem_token_cleanup_records_deleted > 100000
  for: 15m
  severity: warning
  annotations:
    summary: "Cleanup job deleting unusually high number of records"
    description: "Deleted {{ $value }} records. May indicate abnormal token issuance."
```

### 6. Manual Cleanup Script (Emergency)

**For emergency situations when automatic cleanup fails:**
```typescript
// scripts/manual-token-cleanup.ts
import { db } from '@idem/db';
import { oidcStore } from '@idem/db/schema';
import { and, or, lt, isNotNull, isNull } from 'drizzle-orm';
import readline from 'readline';

async function manualCleanup() {
  console.log('🚨 MANUAL TOKEN CLEANUP SCRIPT 🚨\n');

  // 1. Show current state
  const stats = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE consumed_at IS NULL AND expires_at < NOW()) as expired,
      COUNT(*) FILTER (WHERE consumed_at IS NOT NULL) as consumed,
      pg_size_pretty(pg_total_relation_size('idem_oidc_store')) as size
    FROM idem_oidc_store
  `);

  console.log('Current state:');
  console.log(`  Total records: ${stats.rows[0].total}`);
  console.log(`  Expired: ${stats.rows[0].expired}`);
  console.log(`  Consumed: ${stats.rows[0].consumed}`);
  console.log(`  Table size: ${stats.rows[0].size}\n`);

  // 2. Confirm action
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirmed = await new Promise<boolean>((resolve) => {
    rl.question('Proceed with cleanup? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });

  if (!confirmed) {
    console.log('Cleanup cancelled.');
    process.exit(0);
  }

  // 3. Run cleanup
  console.log('\nRunning cleanup...');
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await db.delete(oidcStore)
    .where(
      or(
        and(
          lt(oidcStore.expires_at, new Date()),
          isNull(oidcStore.consumed_at)
        ),
        and(
          isNotNull(oidcStore.consumed_at),
          lt(oidcStore.consumed_at, cutoffDate)
        )
      )
    );

  console.log(`\n✅ Deleted ${result.rowCount} records\n`);

  // 4. Show new state
  const newStats = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      pg_size_pretty(pg_total_relation_size('idem_oidc_store')) as size
    FROM idem_oidc_store
  `);

  console.log('New state:');
  console.log(`  Total records: ${newStats.rows[0].total}`);
  console.log(`  Table size: ${newStats.rows[0].size}`);

  // 5. Run ANALYZE
  console.log('\nRunning ANALYZE...');
  await db.execute(sql`ANALYZE idem_oidc_store`);
  console.log('✅ Done\n');
}

manualCleanup().catch(console.error);
```

**Usage:**
```bash
# Run manual cleanup
pnpm tsx scripts/manual-token-cleanup.ts

# Or via npm script
pnpm cleanup:tokens
```

## Consequences

### Positive
- **Bounded Table Growth**: Automatic cleanup prevents unbounded growth
- **Performance Maintenance**: Regular ANALYZE keeps queries fast
- **Visibility**: Comprehensive monitoring shows cleanup health
- **Alerting**: Failures detected immediately (before they cause issues)
- **Emergency Recovery**: Manual cleanup script for critical situations
- **Audit Trail**: Cleanup runs tracked for compliance

### Negative
- **Cron Dependency**: System health depends on cron reliability
- **False Positives**: Mobile users may trigger IP/UA alerts
- **Storage Overhead**: Cleanup runs table grows over time (mitigated by retention)
- **Operational Overhead**: Monitoring and alerting require maintenance

### Risks and Mitigations

**Risk: Cleanup job deletes active tokens/sessions**
- **Mitigation**: Only delete expired OR consumed tokens (never active)
- **Mitigation**: 7-day grace period after consumption
- **Mitigation**: Comprehensive test suite verifies safe deletion

**Risk: Cleanup job itself fails (DB connection, timeout)**
- **Mitigation**: Graceful error handling (catch, log, alert)
- **Mitigation**: Health check detects missing runs within 36h
- **Mitigation**: Manual cleanup script for emergency recovery

**Risk: Table grows faster than cleanup can handle**
- **Mitigation**: Monitor records deleted per run (alert if > 100K)
- **Mitigation**: Alert at 500K records (warning) and 1M (critical)
- **Mitigation**: Investigate abnormal token issuance patterns

**Risk: Cleanup duration increases over time (performance degradation)**
- **Mitigation**: Monitor cleanup duration (alert if > 5 minutes)
- **Mitigation**: Weekly ANALYZE maintains query performance
- **Mitigation**: Consider partitioning if table consistently > 500K

## Testing Strategy

### Automated Tests
```typescript
describe('Token Cleanup', () => {
  it('should delete expired tokens', async () => {
    // Create expired token
    await db.insert(oidcStore).values({
      name: 'AccessToken',
      id: 'expired-token',
      expires_at: new Date(Date.now() - 1000),
      consumed_at: null,
    });

    await runTokenCleanup();

    const token = await db.query.oidcStore.findFirst({
      where: eq(oidcStore.id, 'expired-token'),
    });

    expect(token).toBeUndefined();
  });

  it('should NOT delete active tokens', async () => {
    // Create active token
    await db.insert(oidcStore).values({
      name: 'AccessToken',
      id: 'active-token',
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      consumed_at: null,
    });

    await runTokenCleanup();

    const token = await db.query.oidcStore.findFirst({
      where: eq(oidcStore.id, 'active-token'),
    });

    expect(token).toBeDefined();
  });

  it('should keep consumed tokens for 7 days', async () => {
    // Create token consumed 6 days ago
    await db.insert(oidcStore).values({
      name: 'AccessToken',
      id: 'recent-consumed',
      expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      consumed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    await runTokenCleanup();

    const token = await db.query.oidcStore.findFirst({
      where: eq(oidcStore.id, 'recent-consumed'),
    });

    expect(token).toBeDefined(); // Still present (< 7 days)
  });

  it('should record cleanup run', async () => {
    await runTokenCleanup();

    const run = await db.query.cleanupRuns.findFirst({
      where: eq(cleanupRuns.job_name, 'token_cleanup'),
      orderBy: [desc(cleanupRuns.completed_at)],
    });

    expect(run).toBeDefined();
    expect(run.success).toBe(true);
  });

  it('should alert on table size threshold', async () => {
    // Mock table size > 1M
    jest.spyOn(db, 'execute').mockResolvedValueOnce({
      rows: [{ count: '1500000', size: '500 MB' }],
    });

    const sendAlertSpy = jest.spyOn(alerting, 'sendAlert');

    await runTokenCleanup();

    expect(sendAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'critical',
        title: expect.stringContaining('Critical'),
      })
    );
  });
});
```

### Manual Verification
Before production:
- [ ] Run cleanup job manually, verify records deleted
- [ ] Verify active tokens NOT deleted
- [ ] Test cleanup job failure handling (disconnect DB, verify alert)
- [ ] Verify health check shows cleanup status
- [ ] Test manual cleanup script
- [ ] Verify Grafana dashboards show metrics
- [ ] Test alerting rules (simulate threshold breach)

## Implementation Timeline

**Phase 3 (OIDC Provider):**
- Basic cleanup job (delete expired tokens)
- Cleanup runs tracking table
- Manual cleanup script

**Phase 8 (Hardening):**
- Health check integration
- Prometheus metrics
- Grafana dashboards
- Alerting rules (PagerDuty/Opsgenie integration)
- Automated cleanup testing

## References
- ADR 0005 (OIDC Provider and Store)
- Database model: `docs/database-model.txt` (Section 9)
- node-oidc-provider adapter lifecycle documentation
