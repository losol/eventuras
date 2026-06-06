import { Panel } from '@eventuras/ratio-ui/core/Panel';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getHealthDiagnostics, unhealthyChecks } from './system/getHealthDiagnostics';

/**
 * Admin dashboard banner: shown only when the backend reports health problems
 * (e.g. pending migrations), linking on to the full diagnostics on /admin/system.
 * Renders nothing when everything is healthy (or diagnostics couldn't be loaded).
 */
export const HealthAlert = async () => {
  const { checks } = await getHealthDiagnostics();
  const problems = unhealthyChecks(checks);

  if (problems.length === 0) {
    return null;
  }

  return (
    <Panel status="warning" marginY="sm">
      {problems.length} health issue{problems.length === 1 ? '' : 's'} detected (
      {problems.map(check => check.name).join(', ')}).{' '}
      <Link href="/admin/system">View health checks</Link>
    </Panel>
  );
};
