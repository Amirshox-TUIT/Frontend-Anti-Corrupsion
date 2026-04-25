import { useTranslation } from 'react-i18next';

const LANGUAGES = ['uz', 'en', 'ru'];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] p-1">
      {LANGUAGES.map((language) => {
        const isActive = i18n.resolvedLanguage === language;

        return (
          <button
            key={language}
            type="button"
            onClick={() => i18n.changeLanguage(language)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] transition ${
              isActive ? 'bg-[#b3212d] text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {language}
          </button>
        );
      })}
    </div>
  );
}
