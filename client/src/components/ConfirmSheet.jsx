import { useEffect, useState } from 'react'

// Bottom sheet that asks before something that cannot be undone.
// requireCheck: optional sentence the person must tick first.
export default function ConfirmSheet({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger = true,
  requireCheck,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const blocked = busy || (requireCheck && !checked)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" aria-label={title} className="safe-bottom w-full rounded-t-3xl bg-card p-5 shadow-xl sm:max-w-md sm:rounded-3xl">
        <h2 className="text-lg font-bold">{title}</h2>
        {body && <p className="mt-1 text-sm text-muted">{body}</p>}
        {requireCheck && (
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--sage)]" />
            <span>{requireCheck}</span>
          </label>
        )}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={blocked}
            className={`min-h-12 flex-1 rounded-xl px-4 font-bold text-white disabled:opacity-40 ${danger ? 'bg-danger' : 'bg-sage'}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-12 flex-1 rounded-xl border-2 border-sage px-4 font-semibold text-sage disabled:opacity-40"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
