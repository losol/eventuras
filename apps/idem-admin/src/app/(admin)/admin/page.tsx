import { KeyRound, Users, Shield, Key } from 'lucide-react';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';

import { DashboardCard } from '@/components/DashboardCard';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <Heading as="h1">Dashboard</Heading>
        <Text className="text-muted mt-2">
          Manage your identity provider settings and OAuth clients.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="OAuth Clients"
          description="Manage registered OAuth applications and their permissions."
          href="/admin/clients"
          icon={KeyRound}
        />

        <DashboardCard
          title="Accounts"
          description="View and manage user accounts."
          href="/admin/accounts"
          icon={Users}
          disabled
        />

        <DashboardCard
          title="Identity Providers"
          description="Configure external identity providers."
          href="/admin/providers"
          icon={Shield}
          disabled
        />

        <DashboardCard
          title="JWKS Keys"
          description="Manage JSON Web Key Sets for token signing."
          href="/admin/keys"
          icon={Key}
          disabled
        />
      </div>
    </div>
  );
}
