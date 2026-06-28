'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import api from '@/services/api';
import { formatDatePtBr, formatDateTimePtBr } from '@/utils/date';

const ARTE_LABELS = {
    rede_boiera: 'Rede Boiera',
    espinhel: 'Espinhel',
    mergulho: 'Mergulho',
    rede_fundeio: 'Rede Fundeio',
    linha_mao: 'Linha de Mão',
    rede_cacoaria: 'Rede Cacoaria',
    covo: 'Covo',
    outras: 'Outras',
    espinhel_mergulho: 'Espinhel/Mergulho'
};

const CONSERVACAO_LABELS = {
    urna: 'Urna',
    caixaTermica: 'Caixa Térmica',
    caixa: 'Caixa Térmica',
    pescadoInNatura: 'Pescado In Natura',
    in_natura: 'Pescado In Natura'
};

function Campo({ label, valor, destaque = false }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
            <span className={`text-sm ${destaque ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                {valor || '-'}
            </span>
        </div>
    );
}

function SecaoCard({ titulo, icone, children }) {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>{icone}</span> {titulo}
            </h2>
            {children}
        </div>
    );
}

function Gradecampos({ children, cols = 2 }) {
    return (
        <div className={`grid grid-cols-1 ${cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-x-8 gap-y-4`}>
            {children}
        </div>
    );
}

function Divisor({ label }) {
    return (
        <div className="col-span-full mt-2 mb-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-1">{label}</p>
        </div>
    );
}

export default function DetalhesDesembarque() {
    const params = useParams();
    const router = useRouter();
    const { usuario } = useAuth();
    const [desembarque, setDesembarque] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (params.id) carregarDesembarque();
    }, [params.id]);

    const carregarDesembarque = async () => {
        try {
            setLoading(true);
            setErro(null);
            const response = await api.getDesembarque(params.id);
            if (response.success) {
                setDesembarque(response.data);
            } else {
                setErro('Desembarque não encontrado');
            }
        } catch (error) {
            if (error.status === 404) setErro(`Desembarque #${params.id} não encontrado`);
            else if (error.status === 401) setErro('Você precisa estar autenticado para visualizar este desembarque');
            else if (error.status === 403) setErro('Você não tem permissão para visualizar este desembarque');
            else setErro(error.message || 'Erro ao carregar desembarque');
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (data) => formatDatePtBr(data);
    const formatarDataHora = (data, time = null) => formatDateTimePtBr(data, time);

    const formatarMoeda = (valor) => {
        if (!valor && valor !== 0) return '-';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    const formatarPeso = (peso, unidade = 'kg') => {
        if (!peso && peso !== 0) return '-';
        return `${parseFloat(peso).toFixed(2)} ${unidade}`;
    };

    const formatarCoordenada = (valor) => {
        if (!valor && valor !== 0) return '-';
        return Number(valor).toFixed(6);
    };

    const formatarConservacao = (valor) => CONSERVACAO_LABELS[valor] || valor || '-';

    const formatarArte = (arte) => ARTE_LABELS[arte] || (arte ? arte.replace(/_/g, ' ') : '-');

    const formatarCondicaoPeixe = (valor) => {
        if (valor === true || valor === 'com_visceras') return 'Com vísceras';
        if (valor === false || valor === 'sem_visceras') return 'Sem vísceras';
        return '-';
    };

    const formatarAtuouNaPesca = (valor) => {
        if (valor === 'S' || valor === 'sim') return 'Sim';
        if (valor === 'N' || valor === 'nao') return 'Não';
        return '-';
    };

    const formatarResponsavel = (responsavel, fallbackNome, fallbackFuncaoPadrao) => {
        const nome = responsavel?.nome || fallbackNome;
        if (!nome) return '-';
        const funcao = responsavel?.funcao || fallbackFuncaoPadrao;
        return funcao ? `${nome} (${funcao})` : nome;
    };

    const handleImprimir = () => window.print();

    const handleExportar = () => {
        if (!desembarque) return;
        let csv = '\uFEFF';
        csv += 'Codigo Desembarque;Data Coleta;Municipio;Localidade;Pescador;CPF;Embarcacao;Codigo Embarcacao;Proprietario;CPF Proprietario;Tripulantes;';
        csv += 'Lat Ida;Long Ida;Lat Volta;Long Volta;';
        csv += 'Especies Capturadas;Detalhes das Capturas;Individuos (Biometria);';
        csv += 'Artes de Pesca;Tamanho das Artes (m);';
        csv += 'Combustivel (L);Tipo Combustivel;Gelo (kg);Rancho (R$);Destino Pescado;Total Desembarque (R$)\n';

        const d = desembarque;
        const artes = d.artes?.length > 0 ? d.artes.map(a => formatarArte(a.arte)).join(' + ') : '';
        const tamanhosArte = d.artes?.length > 0 ? d.artes.map(a => a.tamanho || '0').join(' + ') : '';

        let especiesCapturadas = '';
        let detalhesCaptura = '';
        if (d.capturas?.length > 0) {
            const especiesList = [];
            const detalhesList = [];
            d.capturas.forEach(c => {
                let especieNome = c.especie?.nome_popular || c.especie?.nome_cientifico || `Espécie ID #${c.ID_especie}`;
                if (c.especie?.nome_popular && c.especie?.nome_cientifico) especieNome += ` (${c.especie.nome_cientifico})`;
                especiesList.push(especieNome.replace(/;/g, ','));
                let detalhes = `${especieNome}: ${c.peso_kg || 0}kg`;
                if (c.preco_kg) detalhes += ` × R$${c.preco_kg}/kg`;
                if (c.preco_total) detalhes += ` = R$${c.preco_total}`;
                detalhesList.push(detalhes.replace(/;/g, ','));
            });
            especiesCapturadas = especiesList.join(' | ');
            detalhesCaptura = detalhesList.join(' | ');
        }

        let individuosBiometria = '';
        if (d.individuos?.length > 0) {
            individuosBiometria = d.individuos.map(ind => {
                const esp = ind.especie?.nome_popular || `ID#${ind.ID_especie}`;
                const dados = [];
                if (ind.comprimento_total_cm) dados.push(`CT:${ind.comprimento_total_cm}cm`);
                if (ind.comprimento_padrao_cm) dados.push(`CP:${ind.comprimento_padrao_cm}cm`);
                if (ind.comprimento_forquilha_cm) dados.push(`CF:${ind.comprimento_forquilha_cm}cm`);
                if (ind.peso_g) dados.push(`P:${ind.peso_g}g`);
                if (ind.sexo) dados.push(`S:${ind.sexo}`);
                if (ind.estadio_gonadal) dados.push(`E:${ind.estadio_gonadal}`);
                return `${esp} [${dados.join(', ')}]`;
            }).join(' | ');
        }

        const linha = [
            d.cod_desembarque || '',
            formatarData(d.data_coleta),
            (d.municipio || '').replace(/;/g, ','),
            (d.localidade || '').replace(/;/g, ','),
            (d.pescador?.nome || '').replace(/;/g, ','),
            d.pescador?.cpf || '',
            (d.embarcacao?.nome_embarcacao || '').replace(/;/g, ','),
            d.embarcacao?.codigo_embarcacao || '',
            (d.embarcacao?.proprietario || '').replace(/;/g, ','),
            d.embarcacao?.cpf_proprietario || '',
            d.numero_tripulantes || '0',
            d.lat_ida || '', d.long_ida || '',
            d.lat_volta || '', d.long_volta || '',
            especiesCapturadas, detalhesCaptura, individuosBiometria,
            artes, tamanhosArte,
            d.litros || '0',
            d.desp_diesel ? 'Diesel' : d.desp_gasolina ? 'Gasolina' : '',
            d.gelo_kg || '0', d.rancho_valor || '0',
            d.destino_pescado || '',
            d.total_desembarque || '0'
        ];

        csv += linha.join(';') + '\n';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `desembarque_${d.cod_desembarque || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExcluir = async () => {
        if (!confirm('Tem certeza que deseja excluir este desembarque? Esta ação não pode ser desfeita.')) return;
        try {
            setLoading(true);
            await api.deletarDesembarque(params.id);
            router.push('/meus-desembarques');
        } catch (error) {
            setErro(error.message || 'Erro ao excluir desembarque');
            setLoading(false);
        }
    };

    const d = desembarque;

    return (
        <ProtectedRoute>
            {loading && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando desembarque...</p>
                    </div>
                </div>
            )}

            {erro && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Erro</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{erro}</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => carregarDesembarque()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                    Tentar Novamente
                                </button>
                                <button onClick={() => router.push('/meus-desembarques')} className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                    Voltar para Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !erro && d && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Cabeçalho */}
                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{d.cod_desembarque}</h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{d.municipio} — {d.localidade}</p>
                                </div>
                                <div className="flex flex-wrap gap-3 print:hidden">
                                    <button onClick={() => router.push('/meus-desembarques')} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                        <span>←</span> Voltar
                                    </button>
                                    <button onClick={handleImprimir} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                        <span>🖨️</span> Imprimir
                                    </button>
                                    <button onClick={handleExportar} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                        <span>📥</span> Exportar
                                    </button>
                                    {usuario?.funcao === 'Administrador' && (
                                        <>
                                            <button onClick={() => router.push(`/desembarque?edit=${params.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                                <span>✏️</span> Editar
                                            </button>
                                            <button onClick={handleExcluir} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                                <span>🗑️</span> Excluir
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Estatísticas rápidas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-brand/10 dark:bg-brand/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Valor Total</p>
                                    <p className="text-2xl font-bold text-brand dark:text-brand-light">{formatarMoeda(d.total_desembarque)}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Espécies</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{d.estatisticas?.total_especies || 0}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Peso Total</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatarPeso(d.estatisticas?.peso_total_kg)}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Indivíduos</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{d.estatisticas?.total_individuos_medidos || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── 1. Local e Identificação ── */}
                        <SecaoCard titulo="Local e Identificação" icone="📍">
                            <GradesCampos cols={2}>
                                <Campo label="Código do desembarque" valor={d.cod_desembarque} destaque />
                                <Campo label="Número consecutivo" valor={d.consecutivo} />
                                <Campo label="Município" valor={d.municipio} />
                                <Campo label="Localidade" valor={d.localidade} />
                                <Campo label="Data da coleta" valor={formatarData(d.data_coleta)} />
                                <Campo label="Código da foto" valor={d.cod_foto} />
                                <Campo label="Data/Hora saída" valor={formatarDataHora(d.data_saida, d.hora_saida)} />
                                <Campo label="Data/Hora chegada" valor={formatarDataHora(d.data_chegada, d.hora_desembarque)} />
                            </GradesCampos>
                        </SecaoCard>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* ── 2. Pescador ── */}
                            <SecaoCard titulo="Pescador" icone="👤">
                                <GradesCampos cols={2}>
                                    <Campo label="Nome" valor={d.pescador?.nome} destaque />
                                    <Campo label="Apelido" valor={d.pescador?.apelido} />
                                    <Campo label="CPF" valor={d.pescador?.cpf} />
                                    {d.pescador?.rgp && <Campo label="RGP" valor={d.pescador.rgp} />}
                                    {d.pescador?.nascimento && <Campo label="Nascimento" valor={formatarData(d.pescador.nascimento)} />}
                                    <Campo label="Atuou na pesca" valor={formatarAtuouNaPesca(d.atuou_pesca)} />
                                </GradesCampos>
                            </SecaoCard>

                            {/* ── 3. Proprietário ── */}
                            <SecaoCard titulo="Proprietário" icone="🪪">
                                <GradesCampos cols={2}>
                                    <Campo label="Nome" valor={d.embarcacao?.proprietario || d.proprietario} destaque />
                                    <Campo label="Apelido" valor={d.embarcacao?.apelido_propietario || d.apelido_proprietario} />
                                    <Campo label="CPF" valor={d.embarcacao?.cpf_proprietario} />
                                    <Campo label="Naturalidade" valor={d.embarcacao?.localidade} />
                                    <Campo label="Município da embarcação" valor={d.embarcacao?.municipio} />
                                </GradesCampos>
                            </SecaoCard>

                            {/* ── 4. Embarcação ── */}
                            <SecaoCard titulo="Embarcação" icone="⛵">
                                <GradesCampos cols={2}>
                                    <Campo label="Nome" valor={d.embarcacao?.nome_embarcacao} destaque />
                                    <Campo label="Código" valor={d.embarcacao?.codigo_embarcacao} />
                                    <Campo label="Tipo" valor={d.embarcacao?.tipo_outro || d.embarcacao?.tipo} />
                                    <Campo label="Comprimento" valor={d.embarcacao?.comprimento ? `${d.embarcacao.comprimento} m` : null} />
                                    <Campo label="Capacidade de estocagem" valor={d.embarcacao?.capacidade ? `${d.embarcacao.capacidade} kg` : null} />
                                    <Campo label="Força do motor" valor={d.embarcacao?.hp ? `${d.embarcacao.hp} HP` : null} />
                                    <Campo label="Conservação (possui)" valor={formatarConservacao(d.embarcacao?.possui)} />
                                    <Campo label="Nº de tripulantes" valor={d.numero_tripulantes} />
                                    <Campo label="Nº de pesqueiros" valor={d.pesqueiros} />
                                </GradesCampos>
                            </SecaoCard>

                            {/* ── 5. Artes de Pesca ── */}
                            {d.artes?.length > 0 && (
                                <SecaoCard titulo="Artes de Pesca" icone="🎣">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arte</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome (outras)</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tamanho</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantidade</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {d.artes.map((arte, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{formatarArte(arte.arte)}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{arte.nome || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white text-right">{arte.tamanho || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white text-right">{arte.quantidade || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{arte.unidade || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </SecaoCard>
                            )}
                        </div>

                        {/* ── 6. Viagem, Despesas e Destino ── */}
                        <SecaoCard titulo="Viagem, Despesas e Destino" icone="🚢">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-1 mb-3">Combustível</p>
                                    <div className="space-y-3">
                                        <Campo label="Tipo" valor={d.desp_diesel ? 'Diesel' : d.desp_gasolina ? 'Gasolina' : null} />
                                        <Campo label="Quantidade" valor={d.litros ? `${d.litros} L` : null} />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-1 mb-3">Outros custos</p>
                                    <div className="space-y-3">
                                        <Campo label="Gelo" valor={d.gelo_kg ? `${d.gelo_kg} kg` : null} />
                                        <Campo label="Rancho" valor={d.rancho_valor ? formatarMoeda(d.rancho_valor) : null} />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-1 mb-3">Destino do pescado</p>
                                    <div className="space-y-3">
                                        <Campo label="Destino" valor={d.destino_pescado ? d.destino_pescado.charAt(0).toUpperCase() + d.destino_pescado.slice(1) : null} />
                                        <Campo label="Nome do indivíduo" valor={d.destino_apelido} />
                                    </div>
                                </div>
                            </div>

                            {/* Coordenadas e Quadrantes */}
                            {(d.lat_ida || d.long_ida || d.lat_volta || d.long_volta || d.quadrante1 || d.quadrante2 || d.quadrante3) && (
                                <div className="mt-6">
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-1 mb-3">Coordenadas e quadrantes</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                        <Campo label="Latitude ida" valor={formatarCoordenada(d.lat_ida)} />
                                        <Campo label="Longitude ida" valor={formatarCoordenada(d.long_ida)} />
                                        <Campo label="Latitude volta" valor={formatarCoordenada(d.lat_volta)} />
                                        <Campo label="Longitude volta" valor={formatarCoordenada(d.long_volta)} />
                                        {d.quadrante1 && <Campo label="Quadrante 1" valor={d.quadrante1} />}
                                        {d.quadrante2 && <Campo label="Quadrante 2" valor={d.quadrante2} />}
                                        {d.quadrante3 && <Campo label="Quadrante 3" valor={d.quadrante3} />}
                                    </div>
                                </div>
                            )}
                        </SecaoCard>

                        {/* ── 7. Capturas ── */}
                        {d.capturas?.length > 0 && (
                            <SecaoCard titulo="Espécies Capturadas" icone="🐟">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Espécie</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome científico</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condição</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peso (kg)</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preço/kg</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {d.capturas.map((captura) => (
                                                <tr key={captura.ID_captura} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {captura.especie?.nome_popular || 'Não identificada'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 italic">
                                                        {captura.especie?.nome_cientifico || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {formatarCondicaoPeixe(captura.com_tripa)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                                        {formatarPeso(captura.peso_kg)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                                        {formatarMoeda(captura.preco_kg)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                                                        {formatarMoeda(captura.preco_total)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                                                <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">Total geral:</td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">{formatarMoeda(d.total_desembarque)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </SecaoCard>
                        )}

                        {/* ── 8. Biometria de Indivíduos ── */}
                        {d.individuos?.length > 0 && (
                            <SecaoCard titulo={`Biometria de Indivíduos (${d.individuos.length} medições)`} icone="📏">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Espécie</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comp. Total (cm)</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comp. Padrão (cm)</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comp. Forquilha (cm)</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peso (g)</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sexo</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estádio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {d.individuos.map((individuo, index) => (
                                                <tr key={individuo.ID_individuo} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{individuo.numero_individuo || index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{individuo.especie?.nome_popular || 'Não identificada'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{individuo.comprimento_total_cm ? parseFloat(individuo.comprimento_total_cm).toFixed(2) : '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{individuo.comprimento_padrao_cm ? parseFloat(individuo.comprimento_padrao_cm).toFixed(2) : '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{individuo.comprimento_forquilha_cm ? parseFloat(individuo.comprimento_forquilha_cm).toFixed(2) : '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{individuo.peso_g ? parseFloat(individuo.peso_g).toFixed(2) : '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center uppercase">{individuo.sexo || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">{individuo.estadio_gonadal || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SecaoCard>
                        )}

                        {/* ── 9. Responsáveis ── */}
                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Coletor:</p>
                                    <p>{formatarResponsavel(d.responsaveis?.coletor, d.coletor, d.coletor_funcao || 'Coletor')}</p>
                                    {d.data_coletor && <p className="text-xs">{formatarData(d.data_coletor)}</p>}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Revisor:</p>
                                    <p>{formatarResponsavel(d.responsaveis?.revisor, d.revisor, d.revisor_funcao || 'Revisor')}</p>
                                    {d.data_revisor && <p className="text-xs">{formatarData(d.data_revisor)}</p>}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Digitador:</p>
                                    <p>{formatarResponsavel(d.responsaveis?.digitador, d.digitador, d.digitador_funcao || 'Digitador')}</p>
                                    {d.data_digitador && <p className="text-xs">{formatarData(d.data_digitador)}</p>}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Cadastro:</p>
                                    <p>{formatarResponsavel(d.responsavel_cadastro, d.usuario?.nome, d.usuario?.funcao)}</p>
                                    {d.createdAt && <p className="text-xs">{formatarData(d.createdAt)}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="print:hidden">
                            <button onClick={() => router.push('/meus-desembarques')} className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white font-medium py-3 px-8 rounded-lg transition-colors">
                                ← Voltar para Meus Desembarques
                            </button>
                        </div>
                    </div>

                    <style jsx global>{`
                        @media print {
                            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                            .print\\:hidden { display: none !important; }
                            .print\\:shadow-none { box-shadow: none !important; }
                        }
                    `}</style>
                </div>
            )}
        </ProtectedRoute>
    );
}

function GradesCampos({ children, cols = 2 }) {
    return (
        <div className={`grid grid-cols-1 ${cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-x-8 gap-y-4`}>
            {children}
        </div>
    );
}