"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

function AnalyticsContent() {
    const router = useRouter();
    const [desembarques, setDesembarques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportando, setExportando] = useState(false);
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
            setError('Erro ao carregar dados para análise');
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
                    const nome = c.especie?.Nome_popular || `Espécie #${c.ID_especie}`;
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

    // 3. Receita total por mês
    const receitaPorMes = () => {
        const meses = {};
        desembarques.forEach(d => {
            if (d.data_coleta && d.total_desembarque) {
                const data = new Date(d.data_coleta);
                const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
                meses[mesAno] = (meses[mesAno] || 0) + parseFloat(d.total_desembarque);
            }
        });
        return Object.entries(meses).sort((a, b) => a[0].localeCompare(b[0]));
    };

    // 4. Artes de pesca mais utilizadas
    const artesMaisUtilizadas = () => {
        const artes = {};
        desembarques.forEach(d => {
            if (d.artes && d.artes.length > 0) {
                d.artes.forEach(a => {
                    const nome = a.arte || 'Não informado';
                    artes[nome] = (artes[nome] || 0) + 1;
                });
            }
        });
        return Object.entries(artes).sort((a, b) => b[1] - a[1]).slice(0, 8);
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

    const exportarCSV = async () => {
        setExportando(true);
        try {
            // Criar CSV com todos os dados (adicionar BOM para UTF-8)
            let csv = '\uFEFF'; // BOM para UTF-8
            csv += 'Codigo Desembarque;Data Coleta;Municipio;Localidade;Pescador;CPF;Embarcacao;Codigo Embarcacao;Tripulantes;';
            csv += 'Quadrante 1;Quadrante 2;Quadrante 3;';
            csv += 'Especie;Peso (kg);Preco por kg;Preco Total;Comprimento (cm);';
            csv += 'Artes de Pesca;Tamanho das Artes (m);';
            csv += 'Combustivel (L);Tipo Combustivel;Gelo (kg);Rancho (R$);Destino Pescado;Total Desembarque (R$)\n';

            desembarques.forEach(d => {
                const pescador = (d.pescador?.nome || '').replace(/;/g, ',');
                const cpf = d.pescador?.cpf || '';
                const embarcacao = (d.embarcacao?.nome_embarcacao || '').replace(/;/g, ',');
                const codigoEmb = d.embarcacao?.codigo_embarcacao || '';
                const municipio = (d.municipio || '').replace(/;/g, ',');
                const localidade = (d.localidade || '').replace(/;/g, ',');
                
                // Formatar data para dd/mm/yyyy
                const dataFormatada = d.data_coleta ? new Date(d.data_coleta).toLocaleDateString('pt-BR') : '';
                
                // Preparar dados de despesas
                const combustivel = d.litros || '0';
                const tipoCombustivel = d.desp_diesel ? 'Diesel' : d.desp_gasolina ? 'Gasolina' : '';
                const gelo = d.gelo_kg || '0';
                const rancho = d.rancho_valor || '0';
                
                // Preparar artes (apenas uma vez por desembarque)
                const artes = d.artes && d.artes.length > 0 
                    ? d.artes.map(a => (a.arte || '').replace(/;/g, ',')).join(' + ') 
                    : '';
                const tamanhosArte = d.artes && d.artes.length > 0 
                    ? d.artes.map(a => (a.tamanho || '0')).join(' + ') 
                    : '';

                // Se tem capturas, criar uma linha para cada captura
                if (d.capturas && d.capturas.length > 0) {
                    d.capturas.forEach(c => {
                        const especieNome = c.especie?.Nome_popular || 'Especie #' + c.ID_especie;
                        const especie = especieNome.replace(/;/g, ',');
                        
                        const linha = [
                            d.cod_desembarque || '',
                            dataFormatada,
                            municipio,
                            localidade,
                            pescador,
                            cpf,
                            embarcacao,
                            codigoEmb,
                            d.numero_tripulantes || '0',
                            d.quadrante1 || '',
                            d.quadrante2 || '',
                            d.quadrante3 || '',
                            especie,
                            c.peso_kg || '0',
                            c.preco_kg || '0',
                            c.preco_total || '0',
                            c.comprimento_cm || '',
                            artes,
                            tamanhosArte,
                            combustivel,
                            tipoCombustivel,
                            gelo,
                            rancho,
                            d.destino_pescado || '',
                            d.total_desembarque || '0'
                        ];
                        
                        csv += linha.join(';') + '\n';
                    });
                } else {
                    // Sem capturas, criar linha com dados básicos
                    const linha = [
                        d.cod_desembarque || '',
                        dataFormatada,
                        municipio,
                        localidade,
                        pescador,
                        cpf,
                        embarcacao,
                        codigoEmb,
                        d.numero_tripulantes || '0',
                        d.quadrante1 || '',
                        d.quadrante2 || '',
                        d.quadrante3 || '',
                        '', // especie
                        '', // peso
                        '', // preco_kg
                        '', // preco_total
                        '', // comprimento
                        artes,
                        tamanhosArte,
                        combustivel,
                        tipoCombustivel,
                        gelo,
                        rancho,
                        d.destino_pescado || '',
                        d.total_desembarque || '0'
                    ];
                    
                    csv += linha.join(';') + '\n';
                }
            });

            // Fazer download do CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `preamar_desembarques_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Exportação concluída com sucesso!');
        } catch (err) {
            console.error('Erro ao exportar:', err);
            alert('Erro ao exportar dados');
        } finally {
            setExportando(false);
        }
    };

    const stats = estatisticasGerais();

    return (
        <div className={`min-h-screen p-4 ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
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
                            Dashboard & Análises
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Total Desembarques</p>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Receita Total</p>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                            {formatarValor(stats.receita)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Peso Total</p>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {stats.pesoTotal.toFixed(2)} kg
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Pescadores</p>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>{stats.pescadoresUnicos}</p>
                                    </div>
                                    <div className="p-3 bg-teal-100 rounded-lg">
                                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Embarcações</p>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>{stats.embarcacoesUnicas}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Ticket Médio</p>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarValor(stats.ticketMedio)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 1. Desembarques por Município */}
                        <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
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
                        <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
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

                        {/* 3. Receita por Mês */}
                        <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                📈 Receita por Mês
                            </h2>
                            <div className="space-y-3">
                                {receitaPorMes().map(([mes, valor]) => (
                                    <div key={mes}>
                                        <div className="flex justify-between mb-1">
                                            <span className={temaEscuro ? 'text-gray-300' : 'text-gray-700'}>{mes}</span>
                                            <span className={`font-semibold ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                                {formatarValor(valor)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-green-600 h-2.5 rounded-full" 
                                                style={{ width: `${(valor / Math.max(...receitaPorMes().map(([, v]) => v))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Artes de Pesca Mais Utilizadas */}
                        <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                🎣 Artes de Pesca Mais Utilizadas
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {artesMaisUtilizadas().map(([arte, count]) => (
                                    <div key={arte} className={`p-4 rounded-lg text-center ${temaEscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <p className={`text-3xl font-bold ${temaEscuro ? 'text-teal-400' : 'text-teal-600'}`}>{count}</p>
                                        <p className={`text-sm mt-1 ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>{arte}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botão de Exportação */}
                        <div className={`p-6 rounded-lg shadow ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                        📊 Exportar Dados
                                    </h2>
                                    <p className={`text-sm mt-1 ${temaEscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Exportar todos os desembarques em formato CSV para análise externa
                                    </p>
                                </div>
                                <button
                                    onClick={exportarCSV}
                                    disabled={exportando}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {exportando ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Exportando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                            Exportar CSV
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Analytics() {
    return (
        <ProtectedRoute>
            <AnalyticsContent />
        </ProtectedRoute>
    );
}
