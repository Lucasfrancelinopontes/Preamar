'use client'

export default function ImportDropzone({ carregando, arquivoNome, onSelecionarArquivo, onAbrirSeletor }) {
  return (
    <div
      className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/50"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
          onSelecionarArquivo(file);
        }
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Upload</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Solte o arquivo aqui ou escolha manualmente</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Aceita planilhas .xlsx e arquivos .csv. O arquivo é lido no navegador, validado pelo backend e só é inserido após sua confirmação.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <button
            type="button"
            onClick={onAbrirSeletor}
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={carregando}
          >
            {carregando ? 'Processando...' : 'Selecionar arquivo'}
          </button>
          <p className="text-xs text-slate-500">
            {arquivoNome ? `Arquivo selecionado: ${arquivoNome}` : 'Nenhum arquivo selecionado'}
          </p>
        </div>
      </div>
    </div>
  );
}