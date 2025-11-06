"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function SelecaoTipo() {
    const router = useRouter();
    const { estaAutenticado, usuario } = useAuth();

    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
        }
    }, [estaAutenticado, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Sistema Preamar</h1>
                            <p className="text-xs text-gray-500">Monitoramento de Desembarque</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
                        <p className="text-xs text-gray-500">{usuario?.funcao}</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Selecione o tipo de registro</h2>
                    <p className="text-lg text-gray-600">Escolha o tipo de desembarque que deseja registrar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Desembarque Marítimo */}
                    <button
                        onClick={() => router.push('/desembarque?tipo=maritimo')}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 text-left group border border-gray-100 hover:border-blue-200"
                    >
                        <div className="p-4 bg-blue-50 rounded-lg mb-4 w-16 group-hover:bg-blue-100 transition-colors">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Desembarque Marítimo</h3>
                        <p className="text-gray-600">Registro de desembarque de pesca marítima, incluindo informações da embarcação e tripulação.</p>
                    </button>

                    {/* Card 2: Desembarque Continental */}
                    <button
                        onClick={() => router.push('/desembarque?tipo=continental')}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 text-left group border border-gray-100 hover:border-green-200"
                    >
                        <div className="p-4 bg-green-50 rounded-lg mb-4 w-16 group-hover:bg-green-100 transition-colors">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Desembarque Continental</h3>
                        <p className="text-gray-600">Registro de desembarque de pesca em águas interiores, rios e lagos.</p>
                    </button>

                    {/* Card 3: Desembarque Estuarino */}
                    <button
                        onClick={() => router.push('/desembarque?tipo=estuarino')}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 text-left group border border-gray-100 hover:border-purple-200"
                    >
                        <div className="p-4 bg-purple-50 rounded-lg mb-4 w-16 group-hover:bg-purple-100 transition-colors">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Desembarque Estuarino</h3>
                        <p className="text-gray-600">Registro de desembarque de pesca em áreas de transição entre rio e mar.</p>
                    </button>
                </div>
            </div>
        </div>
    );
}