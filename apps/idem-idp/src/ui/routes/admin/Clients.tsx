import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAccessToken } from '../../lib/auth';

type OAuthClient = {
  id: string;
  clientId: string;
  clientName: string;
  clientType: string;
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  allowedScopes: string[];
  requirePkce: boolean;
  active: boolean;
  createdAt: string;
  logoUri?: string | null;
  clientUri?: string | null;
};

export default function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const accessToken = getAccessToken();

        const response = await fetch('/api/admin/clients', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.statusText}`);
        }

        const data = await response.json();
        setClients(data.clients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading OAuth clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #dc2626',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Link
            to="/admin"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}
          >
            ← {t('admin.clients.backToDashboard')}
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {t('admin.clients.title')}
          </h1>
          <p style={{ color: '#666', marginTop: '0.25rem' }}>
            {t('admin.clients.clientsCount', { count: clients.length })}
          </p>
        </div>
      </header>

      {clients.length === 0 ? (
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#666', marginBottom: '1rem' }}>{t('admin.clients.noClients')}</p>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>
            {t('admin.clients.noClientsHint')}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    }}
                  >
                    {t('admin.clients.table.clientId')}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    }}
                  >
                    {t('admin.clients.table.name')}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    }}
                  >
                    {t('admin.clients.table.type')}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    }}
                  >
                    {t('admin.clients.table.pkce')}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    }}
                  >
                    {t('admin.clients.table.status')}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                    }}
                  >
                    {t('admin.clients.table.redirectUris')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td
                      style={{
                        padding: '1rem',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      {client.clientId}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{client.clientName}</div>
                      {client.clientUri && (
                        <a
                          href={client.clientUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          {client.clientUri}
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          background:
                            client.clientType === 'confidential' ? '#dbeafe' : '#fef3c7',
                          color:
                            client.clientType === 'confidential' ? '#1e40af' : '#92400e',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                        }}
                      >
                        {t(`admin.clients.types.${client.clientType}`)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {client.requirePkce ? (
                        <span style={{ color: '#16a34a' }}>✓</span>
                      ) : (
                        <span style={{ color: '#dc2626' }}>✗</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          background: client.active ? '#dcfce7' : '#fee2e2',
                          color: client.active ? '#166534' : '#991b1b',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                        }}
                      >
                        {t(`admin.clients.status.${client.active ? 'active' : 'inactive'}`)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <details>
                        <summary
                          style={{ cursor: 'pointer', fontSize: '0.875rem', color: '#2563eb' }}
                        >
                          {client.redirectUris.length} URI
                          {client.redirectUris.length !== 1 ? 's' : ''}
                        </summary>
                        <ul
                          style={{
                            marginTop: '0.5rem',
                            paddingLeft: '1rem',
                            fontSize: '0.75rem',
                          }}
                        >
                          {client.redirectUris.map((uri, idx) => (
                            <li
                              key={idx}
                              style={{ fontFamily: 'monospace', marginBottom: '0.25rem' }}
                            >
                              {uri}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
