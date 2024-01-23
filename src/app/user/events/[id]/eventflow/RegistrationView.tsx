import { EventDto } from '@losol/eventuras/dist/models/EventDto';
import createTranslation from 'next-translate/createTranslation';

import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import MarkdownContent from '@/components/ui/MarkdownContent';

export interface RegistrationViewProps {
  eventInfo: EventDto;
  onEdit?: () => void;
  onCancel?: () => void;
}
const RegistrationView: React.FC<RegistrationViewProps> = ({ eventInfo, onEdit, onCancel }) => {
  const { t } = createTranslation();

  return (
    <div>
      <p>
        You have already registered for this event, you can edit your current registration or go to
        the events detail page.
      </p>
      <div className="dark:bg-gray-700 bg-white my-10 p-3">
        <Link href={`/events/${eventInfo.id}`}>View Event Page</Link>
        {onEdit && (
          <Button onClick={onEdit} data-test-id="edit-registration-button">
            {t('common:buttons.edit')}
          </Button>
        )}
        {onCancel && <Button onClick={onCancel}>{t('common:buttons.cancel')}</Button>}
      </div>
      {eventInfo?.welcomeLetter && (
        <div className="welcome-letter dark:bg-gray-700 bg-white my-10 p-3">
          <Heading as="h2" spacingClassName="mb-5 mt-0 pt-0">
            {t('user:events.welcomeLetter')}
          </Heading>
          <MarkdownContent markdown={eventInfo?.welcomeLetter} />
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
