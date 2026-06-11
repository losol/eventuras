'use client';
import { useTranslations } from 'next-intl';

import { Accordion } from '@eventuras/ratio-ui/core/Accordion';
import { DescriptionList } from '@eventuras/ratio-ui/core/DescriptionList';

import { UserDto } from '@/lib/eventuras-sdk';

interface UserMetadataProps {
  user: UserDto;
}

/**
 * Read-only account metadata (user id, etc.) rendered by {@link UserEditor}
 * when `showMetadata` is set. Renders nothing when the user has no id.
 */
export function UserMetadata({ user }: Readonly<UserMetadataProps>) {
  const t = useTranslations();
  if (!user.id) return null;

  return (
    <Accordion>
      <Accordion.Item className="my-3">
        <Accordion.Summary>{t('user.account.details.title')}</Accordion.Summary>
        <Accordion.Content>
          <DescriptionList>
            <DescriptionList.Item>
              <DescriptionList.Term>{t('user.account.details.userId')}</DescriptionList.Term>
              <DescriptionList.Definition>
                <span className="font-mono select-all">{user.id}</span>
              </DescriptionList.Definition>
            </DescriptionList.Item>
          </DescriptionList>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
