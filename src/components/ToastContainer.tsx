import { useToasts } from '../state/toasts'

export default function ToastContainer() {
  const toasts = useToasts((s) => s.toasts)
  const dismiss = useToasts((s) => s.dismiss)
  if (toasts.length === 0) return null
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <span className="toast-msg">{t.message}</span>
          {t.undo ? (
            <button
              className="toast-undo"
              onClick={async () => {
                await t.undo?.()
                dismiss(t.id)
              }}
            >
              Undo
            </button>
          ) : null}
          <button
            className="toast-x"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
