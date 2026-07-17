import React from 'react';

export default function DeleteConfirmModal({ open, onClose, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-800">Confirmação de exclusão</h3>
        <p className="mt-2 text-sm text-slate-600">Esta ação é irreversível. Todos os dados relacionados à peixaria serão removidos.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : 'Confirmar exclusão'}
          </button>
        </div>
      </div>
    </div>
  );
}
