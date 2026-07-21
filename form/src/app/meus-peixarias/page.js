"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";

const LIMITE_POR_PAGINA = 12;

export default function MeusPeixariasPage() {
    const router = useRouter();

    const [peixarias, setPeixarias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [deletandoId, setDeletandoId] = useState(null);
    const [peixariaParaExcluir, setPeixariaParaExcluir] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [inputCodigo, setInputCodigo] = useState("");
    const [filtroCodigo, setFiltroCodigo] = useState("");

    const carregarPeixarias = useCallback(async (pagina = 1, codigo = "") => {
        try {
            setLoading(true);
            setError("");

            const resposta = await api.listarPeixarias({
                page: pagina,
                limit: LIMITE_POR_PAGINA,
                ...(codigo ? { codigo } : {})
            });

            setPeixarias(Array.isArray(resposta?.data) ? resposta.data : []);
            setTotalPaginas(Number(resposta?.pagination?.pages || 1));
            setTotalRegistros(Number(resposta?.pagination?.total || 0));
        } catch (err) {
            setError(err?.message || "Erro ao carregar peixarias.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarPeixarias(paginaAtual, filtroCodigo);
    }, [paginaAtual, filtroCodigo, carregarPeixarias]);

    const formatarResumo = (valor) => (valor ? String(valor) : "-");

    const formatarCodigo = (peixaria) => peixaria?.cod_peixaria || "-";

    const handleEditar = (id) => {
        router.push(`/peixaria?edit=${id}`);
    };

    const handleNovo = () => {
        router.push("/peixaria");
    };

    const handleExcluir = async (id) => {
        setDeletandoId(id);
        setError("");

        try {
            await api.excluirPeixaria(id);

            const novaPagina = peixarias.length === 1 && paginaAtual > 1
                ? paginaAtual - 1
                : paginaAtual;

            setPeixarias((itens) => itens.filter((peixaria) => peixaria.ID_peixaria !== id));
            setTotalRegistros((valor) => Math.max(0, valor - 1));
            setPeixariaParaExcluir(null);
            setPaginaAtual(novaPagina);
            await carregarPeixarias(novaPagina, filtroCodigo);
            setSuccessMessage("Peixaria excluída com sucesso.");
        } catch (err) {
            setError(err?.message || "Erro ao excluir peixaria.");
            setPeixariaParaExcluir(null);
        } finally {
            setDeletandoId(null);
        }
    };

    const abrirConfirmacaoExclusao = (peixaria, event) => {
        event?.stopPropagation();
        setPeixariaParaExcluir(peixaria);
    };

    const aplicarBuscaCodigo = () => {
        setPaginaAtual(1);
        setFiltroCodigo(inputCodigo.trim());
    };

    const limparBuscaCodigo = () => {
        setInputCodigo("");
        setFiltroCodigo("");
        setPaginaAtual(1);
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-slate-100 py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-10 mb-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
                                    aria-label="Voltar"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800">Minhas Peixarias</h1>
                                    <p className="text-slate-500 mt-2">Cadastros de peixarias com pré-visualização dos dados principais</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleNovo}
                                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Nova Peixaria
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                            <input
                                type="text"
                                value={inputCodigo}
                                onChange={(e) => setInputCodigo(e.target.value)}
                                placeholder="Buscar por código (ex.: JP TU 10 03 26 01)"
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                                type="button"
                                onClick={aplicarBuscaCodigo}
                                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Buscar
                            </button>
                            <button
                                type="button"
                                onClick={limparBuscaCodigo}
                                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-lg text-slate-600">Carregando peixarias...</div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                    )}

                    {successMessage && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{successMessage}</div>
                    )}

                    {!loading && !error && peixarias.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-lg text-slate-600">Nenhuma peixaria cadastrada.</p>
                            <button
                                type="button"
                                onClick={handleNovo}
                                className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Criar primeiro cadastro
                            </button>
                        </div>
                    )}

                    {!loading && !error && peixarias.length > 0 && (
                        <div className="space-y-4">
                            {peixarias.map((peixaria) => (
                                <div
                                    key={peixaria.ID_peixaria}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="text-sm font-mono px-3 py-1 rounded bg-blue-100 text-blue-800">
                                                    #{formatarResumo(peixaria.ID_peixaria)}
                                                </div>
                                                <div className="text-sm font-mono px-3 py-1 rounded bg-emerald-100 text-emerald-800">
                                                    Código: {formatarCodigo(peixaria)}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {formatarResumo(peixaria.municipio)} / {formatarResumo(peixaria.localidade)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Responsável</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(peixaria.responsavel)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Nome</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(peixaria.nome)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Contato</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(peixaria.contato)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Tipo</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(peixaria.tipo_estabelecimento)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleEditar(peixaria.ID_peixaria)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(event) => abrirConfirmacaoExclusao(peixaria, event)}
                                                disabled={deletandoId === peixaria.ID_peixaria}
                                                className={`px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${deletandoId === peixaria.ID_peixaria ? 'bg-red-200 text-red-900' : 'bg-red-100 hover:bg-red-200 text-red-800'}`}
                                            >
                                                {deletandoId === peixaria.ID_peixaria ? 'Excluindo...' : 'Excluir'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <p className="text-sm text-slate-600">Total de registros: {totalRegistros}</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((atual) => Math.max(1, atual - 1))}
                                        disabled={paginaAtual === 1}
                                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-slate-600">Página {paginaAtual} de {totalPaginas}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((atual) => Math.min(totalPaginas, atual + 1))}
                                        disabled={paginaAtual === totalPaginas}
                                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {peixariaParaExcluir && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">Excluir peixaria</h2>
                            <p className="mt-3 text-sm text-slate-600">Tem certeza que deseja excluir esta peixaria?</p>
                            <p className="mt-2 text-sm text-slate-600">Esta ação não poderá ser desfeita.</p>
                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setPeixariaParaExcluir(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExcluir(peixariaParaExcluir.ID_peixaria)}
                                    disabled={deletandoId === peixariaParaExcluir.ID_peixaria}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deletandoId === peixariaParaExcluir.ID_peixaria ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}
