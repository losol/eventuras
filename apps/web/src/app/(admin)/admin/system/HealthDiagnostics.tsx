import { Panel } from '@eventuras/ratio-ui/core/Panel';

import { getHealthDiagnostics } from './getHealthDiagnostics';

/** Maps an ASP.NET health status to a ratio Panel status (red for problems). */
const panelStatus = (status: string) => {
  switch (status) {
    case 'Healthy':
      return 'success' as const;
    case 'Degraded':
      return 'warning' as const;
    case 'Unhealthy':
      return 'error' as const;
    default:
      return 'neutral' as const;
  }
};

/**
 * Renders the API's admin-only `/health/diagnostics` report as ratio Panels —
 * one per check, coloured by status (e.g. pending migrations show as a warning).
 */
export const HealthDiagnostics = async () => {
  const { checks, error } = await getHealthDiagnostics();

  if (error) {
    return <Panel status="error">{error}</Panel>;
  }
  if (checks.length === 0) {
    return <Panel status="success">No diagnostics checks reported.</Panel>;
  }

  return (
    <div className="space-y-2">
      {checks.map(check => {
        const pending = (check.data?.pending as string[] | undefined) ?? [];
        return (
          <Panel key={check.name} status={panelStatus(check.status)}>
            <strong>{check.name}</strong> — {check.status}
            {check.description && <div>{check.description}</div>}
            {pending.length > 0 && (
              <ul className="mt-1 list-inside list-disc font-mono text-xs">
                {pending.map(migration => (
                  <li key={migration}>{migration}</li>
                ))}
              </ul>
            )}
          </Panel>
        );
      })}
    </div>
  );
};
