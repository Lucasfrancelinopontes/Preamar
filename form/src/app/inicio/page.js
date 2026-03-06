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
        <div className={`min-h-screen p-4 ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className={`text-2xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                            Início
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

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className={`text-lg ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                            Carregando dados...
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Cards de Estatísticas Gerais */}
                        <StatsCards items={[
                            { label: 'Total Desembarques', value: stats.total },
                            { label: 'Receita Total', value: formatarValor(stats.receita), color: 'text-green-600' },
                            { label: 'Peso Total', value: `${stats.pesoTotal.toFixed(2)} kg` },
                            { label: 'Pescadores', value: stats.pescadoresUnicos },
                            { label: 'Embarcações', value: stats.embarcacoesUnicas },
                            { label: 'Ticket Médio', value: formatarValor(stats.ticketMedio) }
                        ]} />

                        {/* 1. Desembarques por Município */}
                        <div className="card">
                            <h2 className="heading-secondary">
                                📍 Desembarques por Município
                            </h2>
                            <div className="space-y-3">
                                {desembarquesPorMunicipio().map(([municipio, count]) => (
                                    <div key={municipio}>
                                        <div className="flex justify-between mb-1">
                                            <span className={temaEscuro ? 'text-gray-300' : 'text-gray-700'}>{municipio}</span>
                                            <span className={`font-semibold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full" 
                                                style={{ width: `${(count / desembarques.length) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Espécies Mais Capturadas */}
                        <div className="card">
                            <h2 className="heading-secondary">
                                🐟 Top 10 Espécies Mais Capturadas
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <th className={`text-left py-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>Espécie</th>
                                            <th className={`text-right py-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>Capturas</th>
                                            <th className={`text-right py-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>Peso Total (kg)</th>
                                            <th className={`text-right py-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {especiesMaisCapturadas().map((esp, index) => (
                                            <tr key={index} className={`border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-100'}`}>
                                                <td className={`py-2 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>{esp.nome}</td>
                                                <td className={`text-right py-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>{esp.quantidade}</td>
                                                <td className={`text-right py-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>{esp.peso.toFixed(2)}</td>
                                                <td className={`text-right py-2 font-semibold ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                                    {formatarValor(esp.valor)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
