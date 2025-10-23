import { useTranslations } from 'next-intl';

import { MarkdownContent } from '@eventuras/markdown';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Tabs } from '@eventuras/ratio-ui/core/Tabs';

import Registration from '@/app/(admin)/admin/registrations/Registration';
import { EventDto, RegistrationDto } from "@/lib/eventuras-sdk";
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
  const t = useTranslations();
  return (
    <div>
      <Tabs>
        {/* Welcome letter */}
        {eventInfo?.welcomeLetter ? (
          <Tabs.Item title={t('common.labels.welcome')} id="tab-welcome">
            <div className="welcome-letter dark:bg-gray-700 bg-white my-10 p-3">
              <Heading as="h2">{t('user.events.welcomeLetter')}</Heading>
              <MarkdownContent markdown={eventInfo?.welcomeLetter} />
            </div>
          </Tabs.Item>
        ) : null}
        {/* Program */}
        {eventInfo?.program ? (
          <Tabs.Item title={t('common.labels.program')} id="tab-program">
            <div className="welcome-letter dark:bg-gray-700 bg-white my-10 p-3">
              <Heading as="h2" padding="mb-5 mt-0 pt-0">
                {t('common.labels.program')}
              </Heading>
              <MarkdownContent markdown={eventInfo?.program} />
            </div>
          </Tabs.Item>
        ) : null}
        {/* Registration */}
        <Tabs.Item
          id="tab-registration"
          title={t('common.labels.registration')}
          testId="registrationview-registration-tab"
        >
          <Registration registration={registration} />
          {onCancel && <Button onClick={onCancel}>{t('common.buttons.cancel')}</Button>}
        </Tabs.Item>
        {/* Practical info */}
        {eventInfo?.practicalInformation ? (
          <Tabs.Item title={t('common.labels.practicalInfo')}>
            <Heading as="h2">{t('common.labels.practicalInfo')}</Heading>
            <MarkdownContent markdown={eventInfo?.practicalInformation} />
          </Tabs.Item>
        ) : null}
      </Tabs>
    </div>
  );
};
export default RegistrationView;
