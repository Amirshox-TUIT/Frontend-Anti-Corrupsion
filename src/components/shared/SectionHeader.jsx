export default function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="inline-flex rounded-full bg-[#b3212d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#b3212d]">
          {eyebrow}
        </span>
      ) : null}
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
        {description ? <p className="max-w-3xl text-base text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}
