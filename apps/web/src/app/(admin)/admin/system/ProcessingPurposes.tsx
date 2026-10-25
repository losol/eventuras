import { getTranslations } from 'next-intl/server';

import { Badge } from '@eventuras/ratio-ui/core/Badge';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';
import { Panel } from '@eventuras/ratio-ui/core/Panel';

import { getV3ProcessingPurposes, PurposeKind } from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';

import { CreateProcessingPurpose } from './CreateProcessingPurpose';

/**
 * The organization's current processing purposes: what users are asked to consent
 * to, or may reserve themselves against, on their profile page. Every admin can see
 * them; only a system admin can create one.
 */
export const ProcessingPurposes = async ({ canCreate }: { canCreate: boolean }) => {
  const t = await getTranslations();

  let organizationId: number;
  try {
    organizationId = getOrganizationId();
  } catch {
    return <Panel status="warning">{t('admin.system.purposes.noOrganization')}</Panel>;
  }

  const response = await getV3ProcessingPurposes({
    headers: { 'Eventuras-Org-Id': organizationId },
  });

  if (response.error || !response.data) {
    return <Panel status="error">{t('admin.system.purposes.error')}</Panel>;
  }

  return (
    <>
      {response.data.length === 0 ? (
        <Panel status="info">{t('admin.system.purposes.empty')}</Panel>
      ) : (
        <DescriptionList>
          {response.data.map(purpose => (
            <DescriptionList.Description
              key={purpose.uuid ?? purpose.code}
              term={
                <>
                  {purpose.name}
                  <span className="block font-mono text-xs break-words">
                    {purpose.code} · v{purpose.version}
                  </span>
                </>
              }
            >
              <span className="flex flex-wrap items-center gap-2">
                <Badge variant="subtle" status="info">
                  {purpose.kind === PurposeKind.CONSENT
                    ? t('admin.system.purposes.kind.consent')
                    : t('admin.system.purposes.kind.reservation')}
                </Badge>
                {purpose.hasSpecialCategoryData && (
                  <Badge variant="subtle" status="warning">
                    {t('admin.system.purposes.specialCategory')}
                  </Badge>
                )}
              </span>
              <span className="mt-1 block text-sm">{purpose.text}</span>
            </DescriptionList.Description>
          ))}
        </DescriptionList>
      )}
      {canCreate && (
        <div className="mt-4">
          <CreateProcessingPurpose />
        </div>
      )}
    </>
  );
};
