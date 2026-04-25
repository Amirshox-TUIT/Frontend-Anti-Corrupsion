import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatisticsDashboard from '../features/stats/StatisticsDashboard.jsx';

export default function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <div className="shell-container space-y-8">
      <SectionHeader
        eyebrow={t('stats.eyebrow')}
        title={t('stats.title')}
        description={t('stats.description')}
      />
      <StatisticsDashboard />
    </div>
  );
}
