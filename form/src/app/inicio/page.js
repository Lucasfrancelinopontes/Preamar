"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCards from '@/components/dashboard/StatsCards';
import Sidebar from '@/components/Sidebar';
import api from '@/services/api';
import { Plus } from 'lucide-react';

function InicioContent() {
    const [desembarques, setDesembarques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <div className="flex min-h-screen bg-[#F7F9FA]">
            <Sidebar currentPage="inicio" />
            <div className="flex-1 ml-64 overflow-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-[#0B3B60] text-3xl font-semibold mb-2">Dashboard</h1>
                            <p className="text-[#5A7A92]">Visão geral do sistema de desembarques</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/desembarque'}
                            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white h-12 px-6 rounded-lg flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Desembarque
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex items-center gap-3 text-[#5A7A92]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A896]"></div>
                                <span className="text-lg">Carregando dados...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-xl border shadow-md p-6">
                            <div className="flex items-center gap-3 text-[#DC3545]">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Cards de Estatísticas Gerais */}
                            <StatsCards
                                items={[
                                    { label: 'Total Desembarques', value: stats.total, icon: '📊' },
                                    { label: 'Receita Total', value: formatarValor(stats.receita), icon: '💰' },
                                    { label: 'Peso Total', value: `${stats.pesoTotal.toFixed(2)} kg`, icon: '⚖️' },
                                    { label: 'Pescadores', value: stats.pescadoresUnicos, icon: '👥' },
                                    { label: 'Embarcações', value: stats.embarcacoesUnicas, icon: '🚢' },
                                    { label: 'Ticket Médio', value: formatarValor(stats.ticketMedio), icon: '📈' }
                                ]}
                            />

                            {/* Grid de Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 1. Desembarques por Município */}
                                <div className="bg-white rounded-xl border shadow-md">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-[#0B3B60]/10">
                                                <span className="text-2xl">📍</span>
                                            </div>
                                            <h2 className="text-[#0B3B60] text-xl font-semibold">
                                                Desembarques por Município
                                            </h2>
                                        </div>
                                        <div className="space-y-4">
                                            {desembarquesPorMunicipio().map(([municipio, count]) => (
                                                <div key={municipio} className="group">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium text-[#0B3B60] group-hover:text-[#00A896] transition-colors">
                                                            {municipio}
                                                        </span>
                                                        <span className="font-bold text-lg text-[#0B3B60]">
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-[#E8EDF2] rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="bg-[#0B3B60] h-3 rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${(count / desembarques.length) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Espécies Mais Capturadas */}
                                <div className="bg-white rounded-xl border shadow-md">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-[#00A896]/10">
                                                <span className="text-2xl">🐟</span>
                                            </div>
                                            <h2 className="text-[#0B3B60] text-xl font-semibold">
                                                Top 10 Espécies Mais Capturadas
                                            </h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-[#E8EDF2]">
                                                        <th className="text-left py-3 font-semibold text-[#5A7A92]">Espécie</th>
                                                        <th className="text-right py-3 font-semibold text-[#5A7A92]">Capturas</th>
                                                        <th className="text-right py-3 font-semibold text-[#5A7A92]">Peso (kg)</th>
                                                        <th className="text-right py-3 font-semibold text-[#5A7A92]">Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {especiesMaisCapturadas().map((esp, index) => (
                                                        <tr key={index} className="border-b border-[#E8EDF2] hover:bg-[#F7F9FA]/50 transition-colors">
                                                            <td className="py-3 font-medium text-[#0B3B60]">{esp.nome}</td>
                                                            <td className="text-right py-3 text-[#5A7A92]">{esp.quantidade}</td>
                                                            <td className="text-right py-3 text-[#5A7A92]">{esp.peso.toFixed(2)}</td>
                                                            <td className="text-right py-3 font-semibold text-[#00A896]">
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
                        </div>
                    )}
                </div>
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
