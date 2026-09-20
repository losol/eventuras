import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { isCurrentUserSystemAdmin } from '@/utils/auth/checkAuthorization';

import { ErrorTestButton } from './ErrorTestButton';
import { HealthDiagnostics } from './HealthDiagnostics';
import { OrganizationSettings } from './OrganizationSettings';
import { SentryDiagnostics } from './SentryDiagnostics';
import { VersionInfo } from './VersionInfo';

interface SystemSectionProps {
  title: string;
  description?: string;
  /** Marks the section as one only system admins get to see. */
  restricted?: boolean;
  children: ReactNode;
}

const SystemSection = async ({
  title,
  description,
  restricted,
  children,
}: Readonly<SystemSectionProps>) => {
  const t = await getTranslations();
  return (
    <Section>
      <Container>
        <Heading.Group>
          {restricted && <Heading.Eyebrow>{t('admin.system.systemAdminOnly')}</Heading.Eyebrow>}
          <Heading as="h2">{title}</Heading>
        </Heading.Group>
        {description && <p className="mt-2 mb-4 max-w-prose text-sm">{description}</p>}
        {children}
      </Container>
    </Section>
  );
};

/**
 * System page. Health and version are open to every admin — they explain the
 * state of the installation. Settings and the error-triggering diagnostics are
 * SystemAdmin-only, and those sections are labelled as such.
 */
const AdminSystemPage = async () => {
  const t = await getTranslations();
  const systemAdmin = await isCurrentUserSystemAdmin();

  return (
    <>
      <Section className="py-8">
        <Container>
          <Heading as="h1">{t('admin.system.page.title')}</Heading>
          <p className="max-w-prose text-sm">{t('admin.system.page.description')}</p>
        </Container>
      </Section>

      <SystemSection title={t('admin.system.health.title')}>
        <HealthDiagnostics />
      </SystemSection>

      <SystemSection title={t('admin.system.version.title')}>
        <VersionInfo />
      </SystemSection>

      {systemAdmin && (
        <>
          <SystemSection
            title={t('admin.system.settings.title')}
            description={t('admin.system.settings.description')}
            restricted
          >
            <OrganizationSettings />
          </SystemSection>

          <SystemSection
            title={t('admin.system.diagnostics.title')}
            description={t('admin.system.diagnostics.description')}
            restricted
          >
            <Heading as="h3">{t('admin.system.diagnostics.backendApi')}</Heading>
            <ErrorTestButton />
            <Heading as="h3">{t('admin.system.diagnostics.webApp')}</Heading>
            <SentryDiagnostics />
          </SystemSection>
        </>
      )}
    </>
  );
};

export default AdminSystemPage;
