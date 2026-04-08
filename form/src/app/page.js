"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { usuario, carregando, estaAutenticado, ehAdmin, logout } = useAuth();

    if (carregando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#eef7fa] text-gray-600">
                Carregando sessão...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#eef7fa] font-sans pb-10">
            <header className="flex justify-between items-center px-6 md:px-8 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Sistema Preamar</h1>
                            <p className="text-xs text-blue-600 font-semibold">{usuario?.funcao || 'Visitante'}</p>
                        </div>
                    </div>
                </div>

                {estaAutenticado() ? (
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-lg border border-gray-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"></path>
                        </svg>
                        <span className="hidden md:inline">Sair</span>
                    </button>
                ) : (
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Entrar
                    </button>
                )}
            </header>

            <main className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2">
                        {estaAutenticado() ? `Olá, ${usuario?.nome}!` : 'Bem-vindo ao Sistema Preamar'}
                    </h2>
                    <p className="text-gray-600 text-base">
                        {estaAutenticado()
                            ? 'Escolha uma das funcionalidades abaixo para começar.'
                            : 'Faça login para acessar as funcionalidades do sistema.'}
                    </p>
                </div>

                {estaAutenticado() ? (
                    <>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Area Operacional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <Link href="/desembarque" className="block group">
                                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-transparent hover:border-blue-400 transition-all cursor-pointer flex items-center gap-4 h-full">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1e293b] group-hover:text-blue-600 leading-tight">Novo Desembarque</h3>
                                        <p className="text-gray-500 text-xs mt-1">Registar nova coleta</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/meus-desembarques" className="block group">
                                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-transparent hover:border-blue-400 transition-all cursor-pointer flex items-center gap-4 h-full">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1e293b] group-hover:text-blue-600 leading-tight">
                                            {ehAdmin() ? 'Todos os Desembarques' : 'Meus Desembarques'}
                                        </h3>
                                        <p className="text-gray-500 text-xs mt-1">Visualizar e editar registos</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {ehAdmin() && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Administracao e Relatorios</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Link href="/analytics" className="block group">
                                        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-200 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-4 h-full">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m4 6V7m4 10v-4M5 19h14"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[#1e293b] group-hover:text-emerald-600 leading-tight">Dashboard Geral</h3>
                                                <p className="text-gray-500 text-xs mt-1">Estatisticas globais</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link href="/usuarios" className="block group">
                                        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-200 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-4 h-full">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V18a4 4 0 00-5.356-3.771"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20H4V18a4 4 0 015.356-3.771"></path>
                                                    <circle cx="12" cy="8" r="4" strokeWidth="2"></circle>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[#1e293b] group-hover:text-emerald-600 leading-tight">Utilizadores</h3>
                                                <p className="text-gray-500 text-xs mt-1">Gerir acessos a equipa</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link href="/especies" className="block group">
                                        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-200 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-4 h-full">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13s2.5-4 7-4 7 4 7 4-2.5 4-7 4-7-4-7-4z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[#1e293b] group-hover:text-emerald-600 leading-tight">Gerir Especies</h3>
                                                <p className="text-gray-500 text-xs mt-1">Catalogo de peixes</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link href="/embarcacoes" className="block group">
                                        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-200 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-4 h-full relative overflow-hidden">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[#1e293b] group-hover:text-emerald-600 leading-tight">Embarcacoes</h3>
                                                <p className="text-gray-500 text-xs mt-1">Cadastro da frota local</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 p-10 text-center">
                        <div className="mb-6">
                            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h3>
                            <p className="text-gray-600 mb-6">Faça login para acessar o sistema de registro de desembarques.</p>
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Fazer Login
                        </button>
                    </div>
                )}

                <div className="mt-10 text-center text-gray-500 text-sm">
                    Projeto Preamar - Monitoramento Pesqueiro na Paraiba © 2026
                </div>
            </main>
        </div>
    );
}
