"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

function MeusDesembarquesContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [desembarques, setDesembarques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [temaEscuro, setTemaEscuro] = useState(false);

    useEffect(() => {
        carregarDesembarques();
    }, []);

    const carregarDesembarques = async () => {
        try {
            const data = await api.listarDesembarques();
            setDesembarques(data);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar desembarques:', err);
            setError('Erro ao carregar desembarques');
            setLoading(false);
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return '-';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    return (
        <div className={`min-h-screen p-4 ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/')}
                            className={`p-2 rounded-full ${temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                        >
                            <svg className={`w-6 h-6 ${temaEscuro ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                        </button>
                        <h1 className={`text-2xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                            Meus Desembarques
                        </h1>
                    </div>
                    <button 
                        onClick={() => setTemaEscuro(!temaEscuro)}
                        className={`p-2 rounded-full ${temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                    >
                        {temaEscuro ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className={`text-lg ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                            Carregando desembarques...
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && desembarques.length === 0 && (
                    <div className={`text-center py-12 ${temaEscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <svg className={`w-16 h-16 mx-auto mb-4 ${temaEscuro ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p className={`text-lg ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                            Nenhum desembarque registrado ainda
                        </p>
                        <button
                            onClick={() => router.push('/desembarque')}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Registrar Primeiro Desembarque
                        </button>
                    </div>
                )}

                {!loading && !error && desembarques.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {desembarques.map((desembarque) => (
                            <div 
                                key={desembarque.cod_desembarque}
                                className={`p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
                                    temaEscuro ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                    // Futura implementação: visualizar detalhes
                                    console.log('Ver detalhes:', desembarque.cod_desembarque);
                                }}
                            >
                                {/* Código do Desembarque */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`text-xs font-mono px-2 py-1 rounded ${
                                        temaEscuro ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {desembarque.cod_desembarque}
                                    </div>
                                </div>

                                {/* Informações Principais */}
                                <div className="space-y-2">
                                    <div>
                                        <p className={`text-xs ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Data de Coleta
                                        </p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarData(desembarque.data_coleta)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className={`text-xs ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Município
                                        </p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarque.municipio || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className={`text-xs ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Pescador
                                        </p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarque.pescador?.nome || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className={`text-xs ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Valor Total
                                        </p>
                                        <p className={`font-bold text-lg ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                            {formatarValor(desembarque.total_desembarque)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MeusDesembarques() {
    return (
        <ProtectedRoute>
            <MeusDesembarquesContent />
        </ProtectedRoute>
    );
}
