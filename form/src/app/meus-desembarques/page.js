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
    const [desembarqueSelecionado, setDesembarqueSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [temaEscuro, setTemaEscuro] = useState(false);

    useEffect(() => {
        carregarDesembarques();
    }, []);

    const carregarDesembarques = async () => {
        try {
            const data = await api.listarDesembarques();
            
            if (data.data && data.data.length > 0) {
                // Ordenar por data mais recente
                const desembarquesOrdenados = [...data.data].sort((a, b) => 
                    new Date(b.data_coleta) - new Date(a.data_coleta)
                );
                setDesembarques(desembarquesOrdenados);
            } else {
                setDesembarques([]);
            }
            
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

    const formatarDataHora = (dataString) => {
        if (!dataString) return '-';
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const abrirDetalhes = (desembarque) => {
        setDesembarqueSelecionado(desembarque);
    };

    const fecharDetalhes = () => {
        setDesembarqueSelecionado(null);
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
                    <div className="space-y-4">
                        {desembarques.map((desembarque) => (
                            <div 
                                key={desembarque.cod_desembarque}
                                className={`p-6 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer ${
                                    temaEscuro ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={() => abrirDetalhes(desembarque)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Código do Desembarque */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`text-sm font-mono px-3 py-1 rounded ${
                                                temaEscuro ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {desembarque.cod_desembarque}
                                            </div>
                                            <div className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatarData(desembarque.data_coleta)}
                                            </div>
                                        </div>

                                        {/* Grid de Informações */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                                    Localidade
                                                </p>
                                                <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                    {desembarque.localidade || '-'}
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

                                    {/* Seta para indicar que é clicável */}
                                    <svg className={`w-6 h-6 ml-4 ${temaEscuro ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Detalhes */}
            {desembarqueSelecionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={fecharDetalhes}>
                    <div 
                        className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
                            temaEscuro ? 'bg-gray-800' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header do Modal */}
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h2 className={`text-xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                Detalhes do Desembarque
                            </h2>
                            <button 
                                onClick={fecharDetalhes}
                                className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${
                                    temaEscuro ? 'text-gray-300' : 'text-gray-600'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6 space-y-6">
                            {/* Código e Data */}
                            <div className={`p-4 rounded-lg ${
                                temaEscuro ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                                            Código de Desembarque
                                        </p>
                                        <p className={`text-lg font-mono font-bold ${temaEscuro ? 'text-blue-200' : 'text-blue-900'}`}>
                                            {desembarqueSelecionado.cod_desembarque}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm ${temaEscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                                            Data de Coleta
                                        </p>
                                        <p className={`text-lg font-semibold ${temaEscuro ? 'text-blue-200' : 'text-blue-900'}`}>
                                            {formatarData(desembarqueSelecionado.data_coleta)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Local */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                    📍 Local
                                </h3>
                                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                                    temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Município</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.municipio || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Localidade</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.localidade || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Data de Saída</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarDataHora(desembarqueSelecionado.data_saida)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Data de Chegada</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarDataHora(desembarqueSelecionado.data_chegada)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pescador */}
                            {desembarqueSelecionado.pescador && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        👤 Pescador
                                    </h3>
                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nome</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.pescador.nome || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>CPF</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.pescador.cpf || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Apelido</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.pescador.apelido || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nascimento</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {formatarData(desembarqueSelecionado.pescador.nascimento)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Embarcação */}
                            {desembarqueSelecionado.embarcacao && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        ⛵ Embarcação
                                    </h3>
                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nome</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.nome_embarcacao || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Código</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.codigo_embarcacao || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.tipo || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Comprimento</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.comprimento ? `${desembarqueSelecionado.embarcacao.comprimento}m` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Proprietário</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.proprietario || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Tripulantes</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.numero_tripulantes || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quadrantes */}
                            {(desembarqueSelecionado.quadrante1 || desembarqueSelecionado.quadrante2 || desembarqueSelecionado.quadrante3) && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        🗺️ Quadrantes de Pesca
                                    </h3>
                                    <div className={`flex gap-4 p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        {desembarqueSelecionado.quadrante1 && (
                                            <div className={`px-4 py-2 rounded font-mono font-bold ${
                                                temaEscuro ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-800'
                                            }`}>
                                                {desembarqueSelecionado.quadrante1}
                                            </div>
                                        )}
                                        {desembarqueSelecionado.quadrante2 && (
                                            <div className={`px-4 py-2 rounded font-mono font-bold ${
                                                temaEscuro ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-800'
                                            }`}>
                                                {desembarqueSelecionado.quadrante2}
                                            </div>
                                        )}
                                        {desembarqueSelecionado.quadrante3 && (
                                            <div className={`px-4 py-2 rounded font-mono font-bold ${
                                                temaEscuro ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-800'
                                            }`}>
                                                {desembarqueSelecionado.quadrante3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Artes de Pesca */}
                            {desembarqueSelecionado.artes && desembarqueSelecionado.artes.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        🎣 Artes de Pesca
                                    </h3>
                                    <div className={`p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        {desembarqueSelecionado.artes.map((arte, index) => (
                                            <div key={index} className={`py-2 ${index > 0 ? 'border-t border-gray-600' : ''}`}>
                                                <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                    • {arte.arte} - Tamanho: {arte.tamanho}m
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Capturas */}
                            {desembarqueSelecionado.capturas && desembarqueSelecionado.capturas.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        🐟 Espécies Capturadas
                                    </h3>
                                    <div className={`p-4 rounded-lg space-y-3 ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        {desembarqueSelecionado.capturas.map((captura, index) => (
                                            <div key={index} className={`p-3 rounded ${
                                                temaEscuro ? 'bg-gray-600' : 'bg-white'
                                            }`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className={`font-semibold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                        {captura.especie?.Nome_popular || `Espécie #${captura.ID_especie}`}
                                                    </p>
                                                    <p className={`font-bold text-lg ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                                        {formatarValor(captura.preco_total)}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <p className={temaEscuro ? 'text-gray-400' : 'text-gray-500'}>Peso</p>
                                                        <p className={temaEscuro ? 'text-gray-200' : 'text-gray-700'}>
                                                            {captura.peso_kg} kg
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className={temaEscuro ? 'text-gray-400' : 'text-gray-500'}>Preço/kg</p>
                                                        <p className={temaEscuro ? 'text-gray-200' : 'text-gray-700'}>
                                                            {formatarValor(captura.preco_kg)}
                                                        </p>
                                                    </div>
                                                    {captura.comprimento_cm && (
                                                        <div>
                                                            <p className={temaEscuro ? 'text-gray-400' : 'text-gray-500'}>Comprimento</p>
                                                            <p className={temaEscuro ? 'text-gray-200' : 'text-gray-700'}>
                                                                {captura.comprimento_cm} cm
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Despesas */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                    💰 Despesas
                                </h3>
                                <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${
                                    temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Combustível</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.litros ? `${desembarqueSelecionado.litros}L` : '-'}
                                        </p>
                                        <p className={`text-xs ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {desembarqueSelecionado.desp_diesel ? 'Diesel' : desembarqueSelecionado.desp_gasolina ? 'Gasolina' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Gelo</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.gelo_kg ? `${desembarqueSelecionado.gelo_kg} kg` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Rancho</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarValor(desembarqueSelecionado.rancho_valor)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Destino do Pescado */}
                            {desembarqueSelecionado.destino_pescado && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        🎯 Destino do Pescado
                                    </h3>
                                    <div className={`p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.destino_pescado.charAt(0).toUpperCase() + desembarqueSelecionado.destino_pescado.slice(1)}
                                        </p>
                                        {desembarqueSelecionado.destino_apelido && (
                                            <p className={`text-sm mt-1 ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Apelido: {desembarqueSelecionado.destino_apelido}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className={`p-6 rounded-lg ${
                                temaEscuro ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <p className={`text-lg font-semibold ${temaEscuro ? 'text-green-300' : 'text-green-800'}`}>
                                        Total do Desembarque:
                                    </p>
                                    <p className={`text-3xl font-bold ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                        {formatarValor(desembarqueSelecionado.total_desembarque)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer do Modal */}
                        <div className={`sticky bottom-0 px-6 py-4 border-t ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <button
                                onClick={fecharDetalhes}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
