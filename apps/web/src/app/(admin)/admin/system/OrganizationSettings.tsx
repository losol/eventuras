import { getTranslations } from 'next-intl/server';

import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Panel } from '@eventuras/ratio-ui/core/Panel';

import {
  getV3OrganizationsByOrganizationIdSettings,
  type OrganizationSettingDto,
  OrganizationSettingSensitivity,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

/** Credential-looking names, for an API old enough not to classify settings itself. */
const SECRET_NAME = /key|secret|token|password|pwd/i;

/**
 * The API classifies settings; the name check is a fallback for a deployment where
 * the web app is ahead of it. Without it a version skew would print a credential in
 * clear text — the failure this page exists to avoid.
 */
const isSecret = (setting: OrganizationSettingDto) => {
  if (setting.sensitivity) {
    return setting.sensitivity === OrganizationSettingSensitivity.SECRET;
  }
  return (
    SECRET_NAME.test(setting.name ?? '') && setting.type !== 'Number' && setting.type !== 'Boolean'
  );
};

/** An older API reports no isSet and still sends the value, so fall back to it. */
const isSet = (setting: OrganizationSettingDto) => setting.isSet ?? Boolean(setting.value);

/** Groups by section name; the empty key collects settings the API left unsectioned. */
const groupBySection = (settings: OrganizationSettingDto[]) => {
  const sections = new Map<string, OrganizationSettingDto[]>();
  for (const setting of settings) {
    const section = setting.section ?? '';
    const existing = sections.get(section);
    if (existing) {
      existing.push(setting);
    } else {
      sections.set(section, [setting]);
    }
  }
  return [...sections.entries()];
};

/**
 * The registered organization settings and whether each one is configured —
 * the integrations (SMTP, SendGrid, PowerOffice, Twilio) this installation talks to.
 */
export const OrganizationSettings = async () => {
  const t = await getTranslations();

  // getOrganizationId throws when ORGANIZATION_ID is unset — on a fresh install
  // that would take down the very page you opened to find out what is wrong.
  let organizationId: number;
  try {
    organizationId = getOrganizationId();
  } catch {
    return <Panel status="warning">{t('admin.system.settings.noOrganization')}</Panel>;
  }

  const response = await getV3OrganizationsByOrganizationIdSettings({ path: { organizationId } });

  if (response.error || !response.data) {
    return <Panel status="error">{t('admin.system.settings.error')}</Panel>;
  }
  if (response.data.length === 0) {
    return <Panel status="info">{t('admin.system.settings.empty')}</Panel>;
  }

  return (
    <>
      {groupBySection(response.data).map(([section, settings]) => (
        <div key={section || 'unsectioned'}>
          <Heading as="h3">{section || t('admin.system.settings.otherSection')}</Heading>
          <DescriptionList>
            {settings.map((setting, index) => (
              <DescriptionList.Description
                key={setting.name ?? `${section}-${index}`}
                term={
                  <>
                    {setting.description}
                    <span className="block font-mono text-xs break-words">{setting.name}</span>
                  </>
                }
              >
                <SettingValue setting={setting} />
              </DescriptionList.Description>
            ))}
          </DescriptionList>
        </div>
      ))}
    </>
  );
};

const SettingValue = async ({ setting }: { setting: OrganizationSettingDto }) => {
  const t = await getTranslations();

  // A secret's value never leaves the server, so isSet is the only thing that can
  // say whether it is configured — an empty value here means nothing.
  if (isSecret(setting)) {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <Badge variant="subtle" status="info">
          {t('admin.system.settings.secret')}
        </Badge>
        <Badge variant="subtle" status={isSet(setting) ? 'success' : 'neutral'}>
          {t(isSet(setting) ? 'admin.system.settings.set' : 'admin.system.settings.notSet')}
        </Badge>
      </span>
    );
  }
  if (!isSet(setting)) {
    return <Badge variant="subtle">{t('admin.system.settings.notSet')}</Badge>;
  }
  return <span className="font-mono text-xs break-words">{setting.value}</span>;
};
