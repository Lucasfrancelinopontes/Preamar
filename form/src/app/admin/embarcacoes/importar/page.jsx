'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import api from '@/services/api';
import ImportDropzone from './ImportDropzone';
import ImportPreviewTable from './ImportPreviewTable';
import {
  analisarArquivoImportacao,
  baixarArquivo,
  gerarRelatorioErrosCsv,
  gerarTemplateImportacaoXlsx
} from './utils';

const cardClass = 'rounded-3xl border border-slate-200 bg-white shadow-sm';

const resumoInicial = {
  total: 0,
  validos: 0,
  corrigidos: 0,
  invalidos: 0,
  selecionados: 0
};

export default function ImportarEmbarcacoesPage() {
  const router = useRouter();
  const { estaAutenticado, ehAdmin } = useAuth();
  const inputRef = useRef(null);

  const [arquivoNome, setArquivoNome] = useState('');
  const [previewLocal, setPreviewLocal] = useState(null);
  const [previewServidor, setPreviewServidor] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [carregandoArquivo, setCarregandoArquivo] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [etapa, setEtapa] = useState('idle');

  const linhas = previewServidor?.linhas || previewLocal?.linhas || [];
  const resumo = previewServidor?.resumo || previewLocal?.resumo || resumoInicial;
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / 12));

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }

    if (!ehAdmin()) {
      router.push('/');
    }
  }, [estaAutenticado, ehAdmin, router]);

  useEffect(() => {
    const ids = new Set(linhas.filter((linha) => linha.selecionado).map((linha) => linha.linha));
    setSelectedIds(ids);
    setSelectedRowId(linhas.find((linha) => linha.selecionado)?.linha || null);
    setPaginaAtual(1);
  }, [previewLocal, previewServidor]);

  const linhasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * 12;
    return linhas.slice(inicio, inicio + 12);
  }, [linhas, paginaAtual]);

  const carregarArquivo = async (file) => {
    if (!file) return;

    setErro('');
    setSucesso('');
    setArquivoNome(file.name);
    setCarregandoArquivo(true);
    setEtapa('lendo');

    try {
      const previewLocalDados = await analisarArquivoImportacao(file);
      setPreviewLocal(previewLocalDados);

      setEtapa('validando-servidor');
      const resposta = await api.prepararImportacaoEmbarcacoes(file);
      const dados = resposta.data || resposta;
      setPreviewServidor(dados);
      setSucesso(`Arquivo analisado com sucesso. ${dados.resumo?.total || 0} linha(s) encontrada(s).`);
      setEtapa('preview');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setErro(error.message || 'Erro ao processar arquivo');
      setPreviewLocal(null);
      setPreviewServidor(null);
      setSelectedIds(new Set());
      setSelectedRowId(null);
      setEtapa('erro');
    } finally {
      setCarregandoArquivo(false);
    }
  };

  const toggleLinha = (linhaId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(linhaId);
      } else {
        next.delete(linhaId);
      }
      return next;
    });
  };

  const templateDownload = () => {
    const blob = gerarTemplateImportacaoXlsx();
    baixarArquivo(blob, 'template_importacao_embarcacoes.xlsx');
  };

  const downloadRelatorioErros = () => {
    const linhasComProblema = linhas.filter((linha) => linha.status === 'invalid' || (linha.avisos || []).length > 0);
    if (linhasComProblema.length === 0) {
      setErro('Não há avisos ou erros para exportar.');
      return;
    }

    const csv = gerarRelatorioErrosCsv(linhasComProblema);
    baixarArquivo(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'relatorio_erros_embarcacoes.csv');
  };

  const importarSelecionadas = async () => {
    setErro('');
    setSucesso('');

    const selecionadas = linhas.filter((linha) => selectedIds.has(linha.linha) && linha.status !== 'invalid');

    if (selecionadas.length === 0) {
      setErro('Selecione ao menos uma linha válida para importar.');
      return;
    }

    if (!window.confirm(`Confirmar importação de ${selecionadas.length} linha(s) válida(s)?`)) {
      return;
    }

    try {
      setImportando(true);
      setEtapa('importando');
      const resposta = await api.confirmarImportacaoEmbarcacoes(selecionadas);
      const dados = resposta.data || resposta;
      setSucesso(`Importação concluída. ${dados.inseridas || 0} embarcação(ões) inserida(s).`);
      setSelectedIds(new Set());
      setEtapa('concluido');
      if (dados.logs?.length) {
        console.log('Logs da importação:', dados.logs);
      }
    } catch (error) {
      console.error('Erro ao importar embarcações:', error);
      setErro(error.message || 'Erro ao importar embarcações');
      setEtapa('erro');
    } finally {
      setImportando(false);
    }
  };

  const resumoCards = [
    { label: 'Total', value: resumo.total, tone: 'text-slate-900' },
    { label: 'Válidos', value: resumo.validos, tone: 'text-emerald-700' },
    { label: 'Corrigidos', value: resumo.corrigidos, tone: 'text-amber-700' },
    { label: 'Inválidos', value: resumo.invalidos, tone: 'text-rose-700' }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f4_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className={`${cardClass} overflow-hidden border-slate-200`}> 
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/embarcacoes')}
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
                >
                  Voltar para embarcações
                </button>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Importação em lote</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Importar embarcações por XLSX ou CSV</h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-200 sm:text-base">
                  Faça upload, revise a prévia, veja correções automáticas com aviso visual e confirme apenas as linhas válidas.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                {resumoCards.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-200">{item.label}</p>
                    <p className={`mt-2 text-3xl font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <section className="space-y-6">
            {erro && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {sucesso}
              </div>
            )}

            <ImportDropzone
              carregando={carregandoArquivo}
              arquivoNome={arquivoNome}
              onSelecionarArquivo={carregarArquivo}
              onAbrirSeletor={() => inputRef.current?.click()}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div className={`${cardClass} p-5`}>
                <p className="text-sm text-slate-500">Validas</p>
                <p className="mt-2 text-2xl font-black text-emerald-700">{resumo.validos}</p>
              </div>
              <div className={`${cardClass} p-5`}>
                <p className="text-sm text-slate-500">Corrigidas automaticamente</p>
                <p className="mt-2 text-2xl font-black text-amber-700">{resumo.corrigidos}</p>
              </div>
              <div className={`${cardClass} p-5`}>
                <p className="text-sm text-slate-500">Inválidas</p>
                <p className="mt-2 text-2xl font-black text-rose-700">{resumo.invalidos}</p>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Prévia</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Lidas, normalizadas e marcadas com status</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={templateDownload}
                  >
                    Baixar template XLSX
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={downloadRelatorioErros}
                  >
                    Baixar relatório de erros
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Selecionadas: {selectedIds.size}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Página {paginaAtual} de {totalPaginas}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Etapa: {etapa}</span>
              </div>

              <div className="mt-5">
                <ImportPreviewTable
                  linhas={linhasPaginadas}
                  selectedIds={selectedIds}
                  selectedRowId={selectedRowId}
                  onSelecionarLinha={toggleLinha}
                  onSelecionarDetalhe={(linha) => setSelectedRowId(linha.linha)}
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  onPaginaChange={setPaginaAtual}
                  carregando={carregandoArquivo}
                />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className={`${cardClass} p-5`}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Confirmação</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Importar apenas o que passou na validação</h2>
              <p className="mt-2 text-sm text-slate-600">
                As linhas inválidas ficam bloqueadas. As linhas com correções continuam marcadas, mas com aviso visual e podem ser desmarcadas antes da confirmação.
              </p>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Selecionadas</span>
                  <strong>{selectedIds.size}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Lidas localmente</span>
                  <strong>{previewLocal?.resumo?.total || 0}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Validadas pelo servidor</span>
                  <strong>{previewServidor?.resumo?.total || 0}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={importarSelecionadas}
                disabled={importando || selectedIds.size === 0 || !previewServidor}
                className="mt-5 w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importando ? 'Importando...' : 'Confirmar importação'}
              </button>

              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                O backend executa a inserção em lote com <strong>bulkCreate</strong> e ignora duplicados já detectados.
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Legenda</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
                  <span>Válida</span>
                  <span className="font-semibold">Sem pendências</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
                  <span>Corrigida</span>
                  <span className="font-semibold">Normalização automática</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3 text-rose-800">
                  <span>Inválida</span>
                  <span className="font-semibold">Não será importada</span>
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Detalhe selecionado</p>
              {linhas.find((linha) => linha.linha === selectedRowId) ? (() => {
                const linha = linhas.find((item) => item.linha === selectedRowId);
                return (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">{linha.original?.nome_embarcacao || '-'}</p>
                      <p className="text-slate-500">Linha {linha.linha} · {linha.status}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div><strong>Nome:</strong> {linha.original?.nome_embarcacao || '-'} → {linha.normalizado?.nome_embarcacao || '-'}</div>
                      <div><strong>Tipo:</strong> {linha.original?.tipo || '-'} → {linha.normalizado?.tipo || '-'}</div>
                      <div><strong>Código:</strong> {linha.original?.codigo_embarcacao || '-'} → {linha.normalizado?.codigo_embarcacao || '-'}</div>
                      <div><strong>Possui:</strong> {linha.original?.possui || '-'} → {linha.normalizado?.possui || '-'}</div>
                    </div>

                    {linha.avisos?.length > 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                        <strong className="block">Avisos</strong>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {linha.avisos.map((aviso) => (
                            <li key={aviso}>{aviso}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {linha.erros?.length > 0 && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                        <strong className="block">Erros</strong>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {linha.erros.map((erroItem) => (
                            <li key={erroItem}>{erroItem}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <p className="mt-4 text-sm text-slate-500">Selecione uma linha na tabela para ver o detalhe original e normalizado.</p>
              )}
            </div>
          </aside>
        </main>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            carregarArquivo(file);
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}