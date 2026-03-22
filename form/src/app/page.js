"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { usuario, estaAutenticado, ehAdmin, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
            {/*Header*/}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Sistema de formulário</h1>
                            <p className="text-xs text-gray-500">Desembarque</p>
                        </div>
                    </div>

                    {estaAutenticado() ? (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
                                <p className="text-xs text-gray-500">{usuario?.funcao}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Entrar
                        </button>
                    )}
                </div>
            </header>

            <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
                <div className="max-w-4xl w-full">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Content */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
                            <h2 className="text-3xl font-bold mb-2">Bem-vindo</h2>
                            <p className="text-lg opacity-90">
                                {estaAutenticado() 
                                    ? `Olá, ${usuario?.nome}! Escolha uma das funcionalidades abaixo.`
                                    : 'Faça login para acessar o sistema completo.'
                                }
                            </p>
                        </div>

                        <div className="p-8">
                            {estaAutenticado() ? (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Funcionalidades</h3>
                                    </div>

                                    <div className="flex flex-col gap-4 max-w-md mx-auto">
                                        {/* Botão: Novo Desembarque */}
                                        <button
                                            onClick={() => router.push('/desembarque')}
                                            className="card hover:shadow-2xl transition-all group cursor-pointer border-l-4 border-brand-light"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-brand/10 rounded-lg group-hover:bg-brand/20 transition-all">
                                                        <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                                        </svg>
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="heading-secondary">Novo Desembarque</h4>
                                                        <p className="helper-text">Registrar novo desembarque</p>
                                                    </div>
                                                </div>
                                                <svg className="w-6 h-6 text-brand opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Botão: Visualizar Desembarques (apenas Admin) */}
                                        {ehAdmin() && (
                                            <button
                                                onClick={() => router.push('/meus-desembarques')}
                                                className="card hover:shadow-2xl transition-all group cursor-pointer border-l-4 border-brand-light"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-brand-light/10 rounded-lg group-hover:bg-brand-light/20 transition-all">
                                                            <svg className="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                                            </svg>
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="heading-secondary">Visualizar Desembarques</h4>
                                                            <p className="helper-text">Ver desembarques registrados</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-6 h-6 text-brand-light opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                </div>
                                            </button>
                                        )}

                                        {/* Dashboard e Analytics */}
                                        {ehAdmin() && (
                                            <button onClick={() => router.push('/analytics')} className="btn-outline w-full justify-between">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                                    Dashboard & Análises
                                                </span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        )}

                                        {/* Gerenciar Usuários */}
                                        {ehAdmin() && (
                                            <button onClick={() => router.push('/usuarios')} className="btn-outline w-full justify-between">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                                    Gerenciar Usuários
                                                </span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        )}

                                        {/* Gerenciar Espécies */}
                                        {ehAdmin() && (
                                            <button onClick={() => router.push('/especies')} className="btn-outline w-full justify-between">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                                    Gerenciar Espécies
                                                </span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        )}

                                        {/* Gerenciar Embarcações */}
                                        {ehAdmin() && (
                                            <button onClick={() => router.push('/embarcacoes')} className="btn-outline w-full justify-between">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    Gerenciar Embarcações
                                                </span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
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
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-gray-600">
                        <p>Projeto Preamar - Monitoramento Pesqueiro na Paraíba © 2025</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
