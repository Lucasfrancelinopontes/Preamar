'use client'

const statusStyles = {
  valid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  invalid: 'bg-rose-100 text-rose-800 border-rose-200'
};

const statusLabel = {
  valid: 'Válida',
  warning: 'Corrigida automaticamente',
  invalid: 'Inválida'
};

export default function ImportPreviewTable({
  linhas,
  selectedIds,
  selectedRowId,
  onSelecionarLinha,
  onSelecionarDetalhe,
  paginaAtual,
  totalPaginas,
  onPaginaChange,
  carregando
}) {
  if (!carregando && linhas.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Nenhuma linha disponível para preview.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selecionar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Linha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tipo original</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tipo final</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Avisos</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {linhas.map((linha) => {
              const isSelected = selectedIds.has(linha.linha);
              const isActive = selectedRowId === linha.linha;
              const selecionavel = linha.status !== 'invalid';

              return (
                <tr
                  key={linha.linha}
                  className={`transition ${isActive ? 'bg-emerald-50/80' : 'hover:bg-slate-50'} ${linha.status === 'invalid' ? 'opacity-90' : ''}`}
                  onClick={() => onSelecionarDetalhe(linha)}
                >
                  <td className="px-4 py-4 align-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!selecionavel}
                      onChange={(event) => {
                        event.stopPropagation();
                        onSelecionarLinha(linha.linha, event.target.checked);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-4 align-top text-sm font-medium text-slate-900">{linha.linha}</td>
                  <td className="px-4 py-4 align-top text-sm text-slate-900">
                    <div className="font-medium">{linha.normalizado?.nome_embarcacao || linha.original?.nome_embarcacao || '-'}</div>
                    <div className="mt-1 text-xs text-slate-500">Código: {linha.normalizado?.codigo_embarcacao || linha.original?.codigo_embarcacao || '-'}</div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-slate-700">{linha.original?.tipo || '-'}</td>
                  <td className="px-4 py-4 align-top text-sm text-slate-700">{linha.normalizado?.tipo || '-'}</td>
                  <td className="px-4 py-4 align-top">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[linha.status] || statusStyles.warning}`}>
                      {statusLabel[linha.status] || 'Corrigida'}
                    </span>
                    {linha.erros?.length > 0 && (
                      <div className="mt-2 text-xs text-rose-700">{linha.erros.join(' · ')}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-slate-600">
                    {linha.avisos?.length > 0 ? linha.avisos.join(' · ') : 'Sem avisos'}
                  </td>
                  <td className="px-4 py-4 align-top text-right text-sm">
                    <button
                      type="button"
                      className="text-emerald-700 transition hover:text-emerald-900"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelecionarDetalhe(linha);
                      }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          Página {paginaAtual} de {totalPaginas}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onPaginaChange(Math.max(1, paginaAtual - 1))}
            disabled={paginaAtual <= 1}
          >
            Anterior
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onPaginaChange(Math.min(totalPaginas, paginaAtual + 1))}
            disabled={paginaAtual >= totalPaginas}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}