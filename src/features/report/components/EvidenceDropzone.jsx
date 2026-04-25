import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EvidenceDropzone({ files, onAddFiles, onRemoveFile, error }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const pushFiles = (incomingFiles) => {
    const validated = [];

    Array.from(incomingFiles).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        validated.push({
          invalid: true,
          name: file.name,
          reason: t('report.fileTooLarge'),
        });
        return;
      }

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        validated.push({
          invalid: true,
          name: file.name,
          reason: t('report.unsupportedFile'),
        });
        return;
      }

      validated.push(file);
    });

    onAddFiles(validated);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          pushFiles(event.dataTransfer.files);
        }}
        className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-8 text-center transition hover:border-[#183665] hover:bg-[#183665]/5"
      >
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#183665]/10 text-[#183665]">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
            <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4a7.48 7.48 0 0 0-7.35 6.04A5.995 5.995 0 0 0 6 22h12a6 6 0 0 0 1.35-11.96ZM13 13v4h-2v-4H8l4-4 4 4Z" />
          </svg>
        </span>
        <p className="text-base font-semibold text-slate-900">{t('report.dropzoneTitle')}</p>
        <p className="mt-2 max-w-xl text-sm text-slate-600">{t('report.dropzoneBody')}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          {t('report.fileLimit')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => pushFiles(event.target.files)}
        />
      </button>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <article
              key={file.id || `${file.name}-${file.reason || 'error'}`}
              className={`overflow-hidden rounded-[24px] border ${
                file.invalid ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
              }`}
            >
              {!file.invalid ? (
                <div className="aspect-[16/10] bg-slate-100">
                  {file.type?.startsWith('image/') && file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" />
                  ) : file.type?.startsWith('video/') && file.previewUrl ? (
                    <video src={file.previewUrl} className="h-full w-full object-cover" controls />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#183665]/5 text-[#183665]">
                      <svg viewBox="0 0 24 24" className="h-12 w-12 fill-current">
                        <path d="M18 4H6a2 2 0 0 0-2 2v12.01A1.99 1.99 0 0 0 5.99 20H18a2 2 0 0 0 2-1.99V6a2 2 0 0 0-2-2Zm-8 10-2.5 3.01L6 15l-2 3h12l-4-5-2 3Z" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {file.invalid ? file.reason : formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id || file.name)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="m19 6.41-1.41-1.42L12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
