"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";

const LIMITE_POR_PAGINA = 12;

export default function MeusPescadoresPage() {
    const router = useRouter();

    const [pescadores, setPescadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);

    const carregarPescadores = useCallback(async (pagina = 1) => {
        try {
            setLoading(true);
            setError("");

            const resposta = await api.listarSocioPescadores({
                page: pagina,
                limit: LIMITE_POR_PAGINA
            });

            setPescadores(Array.isArray(resposta?.data) ? resposta.data : []);
            setTotalPaginas(Number(resposta?.pages || 1));
            setTotalRegistros(Number(resposta?.total || 0));
        } catch (err) {
            setError(err?.message || "Erro ao carregar pescadores socioeconômicos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarPescadores(paginaAtual);
    }, [paginaAtual, carregarPescadores]);

    const formatarMunicipio = (pescador) => {
        const municipio = pescador?.coleta?.ID_municipio || pescador?.coleta?.municipio || pescador?.coleta?.municipioInfo?.municipio;
        const localidade = pescador?.coleta?.localidade || pescador?.coleta?.localidadeInfo?.localidade;
        if (!municipio && !localidade) return "-";
        if (municipio && localidade) return `${municipio} / ${localidade}`;
        return municipio || localidade || "-";
    };

    const formatarEmbarcacao = (pescador) => pescador?.embarcacao?.nome_embarcacao || pescador?.embarcacao?.tipo_embarcacao || "-";

    const formatarResumo = (valor) => (valor ? String(valor) : "-");

    const handleEditar = (id) => {
        router.push(`/pescador/editar/${id}`);
    };

    const handleNovo = () => {
        router.push("/pescador");
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-slate-100 py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-10 mb-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">
                                    Meus Pescadores
                                </h1>
                                <p className="text-slate-500 mt-2">
                                    Cadastro socioeconômico dos pescadores existentes
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleNovo}
                                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Novo Cadastro
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-lg text-slate-600">
                                Carregando pescadores...
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && !error && pescadores.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-lg text-slate-600">
                                Nenhum pescador cadastrado ainda.
                            </p>
                            <button
                                type="button"
                                onClick={handleNovo}
                                className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Criar primeiro cadastro
                            </button>
                        </div>
                    )}

                    {!loading && !error && pescadores.length > 0 && (
                        <div className="space-y-4">
                            {pescadores.map((pescador) => (
                                <div
                                    key={pescador.id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="text-sm font-mono px-3 py-1 rounded bg-blue-100 text-blue-800">
                                                    #{formatarResumo(pescador.id)}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {formatarMunicipio(pescador)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Nome</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(pescador.nome)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">CPF</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(pescador.cpf)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Embarcação</p>
                                                    <p className="font-semibold text-slate-800">{formatarEmbarcacao(pescador)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Categoria</p>
                                                    <p className="font-semibold text-slate-800">{formatarResumo(pescador.categoria_pesca)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleEditar(pescador.id)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <span>✏️</span> Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <p className="text-sm text-slate-600">
                                    Total de registros: {totalRegistros}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((atual) => Math.max(1, atual - 1))}
                                        disabled={paginaAtual === 1}
                                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-slate-600">
                                        Página {paginaAtual} de {totalPaginas}
                                    </span>
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
            </main>
        </ProtectedRoute>
    );
}
