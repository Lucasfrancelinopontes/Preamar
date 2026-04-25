"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const formatarDataHora = (valor) => {
    if (!valor) return 'Nao informado';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return 'Nao informado';

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(data);
};

function PerfilContent() {
    const router = useRouter();
    const { usuario, atualizarPerfil } = useAuth();

    const gamificacao = usuario?.gamificacao || {
        total_envios: 0,
        nivel_atual: 1,
        badge_atual: null,
        progresso_percentual: 0,
        proximo_marco: null,
        marcos_conquistados: []
    };

    const progressoPercentual = Math.max(0, Math.min(100, Number(gamificacao.progresso_percentual) || 0));
    const marcosConquistados = Array.isArray(gamificacao.marcos_conquistados)
        ? gamificacao.marcos_conquistados
        : [];

    return (
        <div className="min-h-screen bg-[#eef7fa] p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar
                    </button>

                    <button
                        onClick={atualizarPerfil}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    >
                        Atualizar perfil
                    </button>
                </div>

                <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Perfil do usuario</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-800">{usuario?.nome || 'Usuario'}</h1>
                    <p className="mt-1 text-sm text-slate-500">Informacoes da conta e progresso de uso.</p>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{usuario?.email || 'Nao informado'}</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Funcao</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{usuario?.funcao || 'Nao informado'}</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ultimo login</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{formatarDataHora(usuario?.ultimo_login)}</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Criado em</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">{formatarDataHora(usuario?.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Perfil gamificado</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-800">
                        Nivel {gamificacao.nivel_atual}
                        {gamificacao.badge_atual ? ` • ${gamificacao.badge_atual}` : ''}
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formularios enviados</p>
                            <p className="mt-1 text-2xl font-bold text-slate-800">{gamificacao.total_envios}</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proximo marco</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {gamificacao.proximo_marco
                                    ? `${gamificacao.proximo_marco.badge} (faltam ${gamificacao.proximo_marco.faltam} envio(s))`
                                    : 'Todos os marcos concluidos'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Progresso para o proximo marco</span>
                            <span>{progressoPercentual.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progressoPercentual}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Marcos conquistados</p>
                        {marcosConquistados.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {marcosConquistados.map((marco) => (
                                    <span key={`${marco.envios}-${marco.badge}`} className="badge-success">
                                        {marco.badge} ({marco.envios})
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Nenhum marco conquistado ainda.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PerfilPage() {
    return (
        <ProtectedRoute>
            <PerfilContent />
        </ProtectedRoute>
    );
}
