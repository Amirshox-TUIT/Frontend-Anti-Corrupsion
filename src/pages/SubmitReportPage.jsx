import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import ReportWizard from '../features/report/ReportWizard.jsx';

export default function SubmitReportPage() {
  const { t } = useTranslation();

  return (
    <div className="shell-container space-y-8">
      <SectionHeader
        eyebrow={t('report.eyebrow')}
        title={t('report.title')}
        description={t('report.description')}
      />
      <ReportWizard />
    </div>
  );
}
