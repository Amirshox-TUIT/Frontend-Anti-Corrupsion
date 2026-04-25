export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  closeLabel = 'Close',
  children,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="surface-card max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6 sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {subtitle ? (
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {subtitle}
              </p>
            ) : null}
            <h3 className="mt-1 font-display text-2xl font-semibold text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
