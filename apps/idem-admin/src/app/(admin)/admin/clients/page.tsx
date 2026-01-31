import { ArrowLeft, Check, X } from 'lucide-react';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { Table } from '@eventuras/ratio-ui/core/Table';
import { Panel } from '@eventuras/ratio-ui/core/Panel';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getClients } from './actions';

export const metadata = {
  title: 'OAuth Clients',
};

export default async function ClientsPage() {
  const result = await getClients();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="flex items-center gap-1 text-sm text-muted hover:text-primary-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Heading as="h1">OAuth Clients</Heading>
        <Text className="text-muted mt-2">
          Manage registered OAuth applications.
        </Text>
      </div>

      {!result.success && (
        <Panel variant="alert" intent="error">
          {result.error}
        </Panel>
      )}

      {result.success && result.clients && result.clients.length === 0 && (
        <Panel variant="callout" intent="info">
          No OAuth clients found.
        </Panel>
      )}

      {result.success && result.clients && result.clients.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeadCell>Client ID</Table.HeadCell>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>PKCE</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {result.clients.map((client) => (
                <Table.Row key={client.id || client.clientId}>
                  <Table.Cell>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {client.clientId}
                    </code>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span className="font-medium">{client.clientName}</span>
                      {client.clientUri && (
                        <a
                          href={client.clientUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-muted hover:text-primary-600"
                        >
                          {client.clientUri}
                        </a>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={client.clientType === 'confidential' ? 'info' : 'neutral'}
                    >
                      {client.clientType}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {client.requirePkce ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={client.active ? 'positive' : 'negative'}>
                      {client.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  );
}
