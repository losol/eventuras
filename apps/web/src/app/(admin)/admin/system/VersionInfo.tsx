import { getTranslations } from 'next-intl/server';

import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Panel } from '@eventuras/ratio-ui/core/Panel';

import { getApiVersion, getWebVersion } from './getVersionInfo';

const Value = ({ children }: { children: string }) => (
  <span className="font-mono text-xs break-all">{children}</span>
);

/**
 * Which build of the web app and the API this installation is running —
 * the first thing to check when a report doesn't match the code.
 */
export const VersionInfo = async () => {
  const t = await getTranslations();
  const web = getWebVersion();
  const api = await getApiVersion();

  return (
    <>
      <Heading as="h3">{t('admin.system.version.web')}</Heading>
      <DescriptionList>
        <DescriptionList.Description term={t('admin.system.version.version')}>
          <Value>{web.version}</Value>
        </DescriptionList.Description>
        <DescriptionList.Description term={t('admin.system.version.commit')}>
          <Value>{web.gitSha}</Value>
        </DescriptionList.Description>
        <DescriptionList.Description term={t('admin.system.version.buildTime')}>
          <Value>{web.buildTime}</Value>
        </DescriptionList.Description>
        <DescriptionList.Description term={t('admin.system.version.imageTag')}>
          <Value>{web.imageTag}</Value>
        </DescriptionList.Description>
      </DescriptionList>

      <Heading as="h3">{t('admin.system.version.api')}</Heading>
      {api ? (
        <DescriptionList>
          <DescriptionList.Description term={t('admin.system.version.version')}>
            <Value>{api.version}</Value>
          </DescriptionList.Description>
          <DescriptionList.Description term={t('admin.system.version.commit')}>
            <Value>{api.sha}</Value>
          </DescriptionList.Description>
        </DescriptionList>
      ) : (
        <Panel status="warning">{t('admin.system.version.apiUnavailable')}</Panel>
      )}
    </>
  );
};
