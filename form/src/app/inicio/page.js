"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCards from '@/components/dashboard/StatsCards';
import api from '@/services/api';

function InicioContent() {
    const [desembarques, setDesembarques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [temaEscuro, setTemaEscuro] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const data = await api.listarDesembarques();
            if (data.data) {
                setDesembarques(data.data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError(err.message || 'Erro ao carregar dados para análise');
            setLoading(false);
        }
    };

    // 1. Total de desembarques por município
    const desembarquesPorMunicipio = () => {
        const contagem = {};
        desembarques.forEach(d => {
            const municipio = d.municipio || 'Não informado';
            contagem[municipio] = (contagem[municipio] || 0) + 1;
        });
        return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    };

    // 2. Espécies mais capturadas
    const especiesMaisCapturadas = () => {
        const especies = {};
        desembarques.forEach(d => {
            if (d.capturas && d.capturas.length > 0) {
                d.capturas.forEach(c => {
                    // Melhorar exibição do nome da espécie
                    let nome = '';
                    if (c.especie?.Nome_popular) {
                        nome = c.especie.Nome_popular;
                        if (c.especie.Nome_cientifico) {
                            nome += ` (${c.especie.Nome_cientifico})`;
                        }
                    } else if (c.especie?.Nome_cientifico) {
                        nome = c.especie.Nome_cientifico;
                    } else {
                        nome = `Espécie ID #${c.ID_especie}`;
                    }
                    
                    if (!especies[nome]) {
                        especies[nome] = {
                            quantidade: 0,
                            peso: 0,
                            valor: 0
                        };
                    }
                    especies[nome].quantidade += 1;
                    especies[nome].peso += parseFloat(c.peso_kg) || 0;
                    especies[nome].valor += parseFloat(c.preco_total) || 0;
                });
            }
        });
        return Object.entries(especies)
            .map(([nome, dados]) => ({ nome, ...dados }))
            .sort((a, b) => b.peso - a.peso)
            .slice(0, 10);
    };

    // 5. Estatísticas gerais
    const estatisticasGerais = () => {
        const total = desembarques.length;
        const receita = desembarques.reduce((sum, d) => sum + (parseFloat(d.total_desembarque) || 0), 0);
        const pesoTotal = desembarques.reduce((sum, d) => {
            if (d.capturas && d.capturas.length > 0) {
                return sum + d.capturas.reduce((s, c) => s + (parseFloat(c.peso_kg) || 0), 0);
            }
            return sum;
        }, 0);
        const pescadoresUnicos = new Set(desembarques.map(d => d.ID_pescador).filter(id => id)).size;
        const embarcacoesUnicas = new Set(desembarques.map(d => d.ID_embarcacao).filter(id => id)).size;

        return {
            total,
            receita,
            pesoTotal,
            pescadoresUnicos,
            embarcacoesUnicas,
            ticketMedio: total > 0 ? receita / total : 0
        };
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const stats = estatisticasGerais();

    return (
        <div className={`min-h-screen ${temaEscuro ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50'}`}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${temaEscuro ? 'bg-slate-800/50' : 'bg-white/70'} backdrop-blur-sm shadow-lg`}>
                            <svg className={`w-8 h-8 ${temaEscuro ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className={`text-3xl font-bold ${temaEscuro ? 'text-white' : 'text-slate-900'}`}>
                                Início
                            </h1>
                            <p className={`text-sm mt-1 ${temaEscuro ? 'text-slate-400' : 'text-slate-600'}`}>
                                Visão geral do sistema de desembarques
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setTemaEscuro(!temaEscuro)}
                        className={`p-3 rounded-xl ${temaEscuro ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-white/70 hover:bg-white/90'} backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105`}
                    >
                        {temaEscuro ? (
                            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                            </svg>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className={`flex items-center gap-3 ${temaEscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="text-lg">Carregando dados...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className={`p-6 rounded-xl ${temaEscuro ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'} border backdrop-blur-sm shadow-lg`}>
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span className={`font-medium ${temaEscuro ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Cards de Estatísticas Gerais */}
                        <div className={`p-6 rounded-xl ${temaEscuro ? 'bg-slate-800/50' : 'bg-white/70'} backdrop-blur-sm shadow-xl border ${temaEscuro ? 'border-slate-700/50' : 'border-white/50'}`}>
                            <StatsCards 
                                items={[
                                    { label: 'Total Desembarques', value: stats.total, icon: '📊' },
                                    { label: 'Receita Total', value: formatarValor(stats.receita), color: 'text-emerald-600', icon: '💰' },
                                    { label: 'Peso Total', value: `${stats.pesoTotal.toFixed(2)} kg`, icon: '⚖️' },
                                    { label: 'Pescadores', value: stats.pescadoresUnicos, icon: '👥' },
                                    { label: 'Embarcações', value: stats.embarcacoesUnicas, icon: '🚢' },
                                    { label: 'Ticket Médio', value: formatarValor(stats.ticketMedio), icon: '📈' }
                                ]} 
                                temaEscuro={temaEscuro}
                            />
                        </div>

                        {/* Grid de Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 1. Desembarques por Município */}
                            <div className={`p-6 rounded-xl ${temaEscuro ? 'bg-slate-800/50' : 'bg-white/70'} backdrop-blur-sm shadow-xl border ${temaEscuro ? 'border-slate-700/50' : 'border-white/50'} hover:shadow-2xl transition-all duration-300`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-2 rounded-lg ${temaEscuro ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                        <span className="text-2xl">📍</span>
                                    </div>
                                    <h2 className={`text-xl font-semibold ${temaEscuro ? 'text-white' : 'text-slate-900'}`}>
                                        Desembarques por Município
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {desembarquesPorMunicipio().map(([municipio, count]) => (
                                        <div key={municipio} className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-medium ${temaEscuro ? 'text-slate-300' : 'text-slate-700'} group-hover:${temaEscuro ? 'text-white' : 'text-slate-900'} transition-colors`}>
                                                    {municipio}
                                                </span>
                                                <span className={`font-bold text-lg ${temaEscuro ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {count}
                                                </span>
                                            </div>
                                            <div className={`w-full ${temaEscuro ? 'bg-slate-700' : 'bg-slate-200'} rounded-full h-3 overflow-hidden`}>
                                                <div 
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${(count / desembarques.length) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Espécies Mais Capturadas */}
                            <div className={`p-6 rounded-xl ${temaEscuro ? 'bg-slate-800/50' : 'bg-white/70'} backdrop-blur-sm shadow-xl border ${temaEscuro ? 'border-slate-700/50' : 'border-white/50'} hover:shadow-2xl transition-all duration-300`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-2 rounded-lg ${temaEscuro ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        <span className="text-2xl">🐟</span>
                                    </div>
                                    <h2 className={`text-xl font-semibold ${temaEscuro ? 'text-white' : 'text-slate-900'}`}>
                                        Top 10 Espécies Mais Capturadas
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className={`border-b ${temaEscuro ? 'border-slate-600' : 'border-slate-200'}`}>
                                                <th className={`text-left py-3 font-semibold ${temaEscuro ? 'text-slate-300' : 'text-slate-700'}`}>Espécie</th>
                                                <th className={`text-right py-3 font-semibold ${temaEscuro ? 'text-slate-300' : 'text-slate-700'}`}>Capturas</th>
                                                <th className={`text-right py-3 font-semibold ${temaEscuro ? 'text-slate-300' : 'text-slate-700'}`}>Peso (kg)</th>
                                                <th className={`text-right py-3 font-semibold ${temaEscuro ? 'text-slate-300' : 'text-slate-700'}`}>Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {especiesMaisCapturadas().map((esp, index) => (
                                                <tr key={index} className={`border-b ${temaEscuro ? 'border-slate-700/50' : 'border-slate-100'} hover:${temaEscuro ? 'bg-slate-700/30' : 'bg-slate-50/50'} transition-colors`}>
                                                    <td className={`py-3 font-medium ${temaEscuro ? 'text-white' : 'text-slate-900'}`}>{esp.nome}</td>
                                                    <td className={`text-right py-3 ${temaEscuro ? 'text-slate-300' : 'text-slate-600'}`}>{esp.quantidade}</td>
                                                    <td className={`text-right py-3 ${temaEscuro ? 'text-slate-300' : 'text-slate-600'}`}>{esp.peso.toFixed(2)}</td>
                                                    <td className={`text-right py-3 font-semibold ${temaEscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                        {formatarValor(esp.valor)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Inicio() {
    return (
        <ProtectedRoute>
            <InicioContent />
        </ProtectedRoute>
    );
}
