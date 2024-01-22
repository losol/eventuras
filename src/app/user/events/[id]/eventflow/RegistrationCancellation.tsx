import createTranslation from 'next-translate/createTranslation';

import Button from '@/components/ui/Button';

export type RegistrationCancellationProps = {
  onBack?: () => void;
};
const RegistrationCancellation: React.FC<RegistrationCancellationProps> = ({ onBack }) => {
  const { t } = createTranslation();

  return (
    <div>
      <p>This is a placeholder for eventCancellation</p>
      {onBack && <Button onClick={onBack}>{t('common:buttons.back')}</Button>}
    </div>
  );
};

export default RegistrationCancellation;
