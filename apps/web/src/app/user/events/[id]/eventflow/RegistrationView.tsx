import { MarkdownContent } from '@eventuras/markdown';
import { EventDto, RegistrationDto } from '@eventuras/sdk';
import { Button, Heading } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';

import Registration from '@/app/admin/registrations/Registration';
import Tabs from '@/components/Tabs';

export interface RegistrationViewProps {
  eventInfo: EventDto;
  registration?: RegistrationDto;
  onEdit?: () => void;
  onCancel?: () => void;
}
const RegistrationView: React.FC<RegistrationViewProps> = ({
  eventInfo,
  registration,
  onCancel,
}) => {
  const { t } = createTranslation();

  return (
    <div>
      <Tabs>
        {/* Welcome letter */}
        {eventInfo?.welcomeLetter ? (
          <Tabs.Item title={t('common:labels.welcome')}>
            <div className="welcome-letter dark:bg-gray-700 bg-white my-10 p-3">
              <Heading as="h2">{t('user:events.welcomeLetter')}</Heading>
              <MarkdownContent markdown={eventInfo?.welcomeLetter} />
            </div>
          </Tabs.Item>
        ) : null}

        {/* Program */}
        {eventInfo?.program ? (
          <Tabs.Item title={t('common:labels.program')}>
            <div className="welcome-letter dark:bg-gray-700 bg-white my-10 p-3">
              <Heading as="h2" spacingClassName="mb-5 mt-0 pt-0">
                {t('common:labels.program')}
              </Heading>
              <MarkdownContent markdown={eventInfo?.program} />
            </div>
          </Tabs.Item>
        ) : null}

        {/* Registration */}
        <Tabs.Item
          title={t('common:labels.registration')}
          {...{ [DATA_TEST_ID]: 'registrationview-registration-tab' }}
        >
          <Registration registration={registration} />
          {onCancel && <Button onClick={onCancel}>{t('common:buttons.cancel')}</Button>}
        </Tabs.Item>

        {/* Practical info */}
        {eventInfo?.practicalInformation ? (
          <Tabs.Item title={t('common:labels.practicalInfo')}>
            <Heading as="h2">{t('common:labels.practicalInfo')}</Heading>
            <MarkdownContent markdown={eventInfo?.practicalInformation} />
          </Tabs.Item>
        ) : null}
      </Tabs>
    </div>
  );
};

export default RegistrationView;
