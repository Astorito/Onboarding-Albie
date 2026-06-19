import { useState, type FormEvent } from 'react';
import { adminApi } from './api';

interface Props {
  sessionId: string;
  onboardingName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmModal({ sessionId, onboardingName, onClose, onDeleted }: Props) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const confirmed = typed === 'delete';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    setLoading(true);
    setError('');
    try {
      await adminApi.deleteOnboarding(sessionId);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500 text-base">✕</div>
          <div>
            <h2 className="font-bold text-[#0D3A39] text-base leading-tight">Eliminar onboarding</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{onboardingName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Esta acción es <strong className="text-[#0D3A39]">permanente</strong> y eliminará la fila del Sheet. Para confirmar, escribí <strong>delete</strong> abajo.
          </p>

          <input
            type="text"
            placeholder="delete"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition font-mono"
          />

          {error && (
            <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-xl py-3 text-sm hover:bg-gray-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!confirmed || loading}
              className="flex-1 bg-red-600 text-white font-bold rounded-xl py-3 text-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
