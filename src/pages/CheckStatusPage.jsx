import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatusLookup from '../features/status/StatusLookup.jsx';

export default function CheckStatusPage() {
  const { t } = useTranslation();

  return (
    <div className="shell-container space-y-8">
      <SectionHeader
        eyebrow={t('status.eyebrow')}
        title={t('status.title')}
        description={t('status.description')}
      />
      <StatusLookup />
    </div>
  );
}
