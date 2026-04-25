const STATUS_CLASSNAMES = {
  pending: 'bg-amber-100 text-amber-900',
  accepted: 'bg-blue-100 text-blue-900',
  rejected: 'bg-rose-100 text-rose-900',
  done: 'bg-emerald-100 text-emerald-900',
};

export default function StatusBadge({ status, label }) {
  return (
    <span className={`status-pill ${STATUS_CLASSNAMES[status] || 'bg-slate-100 text-slate-900'}`}>
      {label}
    </span>
  );
}
