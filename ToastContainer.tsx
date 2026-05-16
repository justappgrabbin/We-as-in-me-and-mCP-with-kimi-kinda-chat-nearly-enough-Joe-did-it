import { X } from 'lucide-react';
import useOSStore from '../store/useOSStore';

export default function ToastContainer() {
  const toasts = useOSStore((s) => s.toast);
  const removeToast = useOSStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={12} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
