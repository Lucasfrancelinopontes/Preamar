'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import api from '@/services/api';

export default function DetalhesDesembarque() {
  const params = useParams();
  const router = useRouter();
  const { usuario } = useAuth();
  const [desembarque, setDesembarque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (params.id) {
      carregarDesembarque();
    }
  }, [params.id]);

  const carregarDesembarque = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      console.log('🔍 Carregando desembarque ID:', params.id);
      
      const response = await api.getDesembarque(params.id);
      
      console.log('✅ Resposta recebida:', response);
      
      if (response.success) {
        setDesembarque(response.data);
      } else {
        setErro('Desembarque não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar desembarque:', {
        id: params.id,
        error: error,
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      // Mensagens de erro mais específicas
      if (error.status === 404) {
        setErro(`Desembarque #${params.id} não encontrado`);
      } else if (error.status === 401) {
        setErro('Você precisa estar autenticado para visualizar este desembarque');
      } else if (error.status === 403) {
        setErro('Você não tem permissão para visualizar este desembarque');
      } else {
        setErro(error.message || 'Erro ao carregar desembarque');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPeso = (peso) => {
    if (!peso && peso !== 0) return '-';
    return `${parseFloat(peso).toFixed(2)} kg`;
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportar = () => {
    if (!desembarque) return;

    // Criar CSV com todos os dados (adicionar BOM para UTF-8)
    let csv = '\uFEFF'; // BOM para UTF-8
    csv += 'Codigo Desembarque;Data Coleta;Municipio;Localidade;Pescador;CPF;Embarcacao;Codigo Embarcacao;Proprietario;CPF Proprietario;Tripulantes;';
    csv += 'Lat Ida;Long Ida;Lat Volta;Long Volta;';
    csv += 'Especies Capturadas;Detalhes das Capturas;Individuos (Biometria);';
    csv += 'Artes de Pesca;Tamanho das Artes (m);';
    csv += 'Combustivel (L);Tipo Combustivel;Gelo (kg);Rancho (R$);Destino Pescado;Total Desembarque (R$)\n';

    const d = desembarque;
    const pescador = (d.pescador?.nome || '').replace(/;/g, ',');
    const cpf = d.pescador?.cpf || '';
    const embarcacao = (d.embarcacao?.nome_embarcacao || '').replace(/;/g, ',');
    const codigoEmb = d.embarcacao?.codigo_embarcacao || '';
    const proprietario = (d.embarcacao?.proprietario || '').replace(/;/g, ',');
    const cpfProprietario = d.embarcacao?.cpf_proprietario || '';
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

    // Agrupar todas as espécies em uma string
    let especiesCapturadas = '';
    let detalhesCaptura = '';
    
    if (d.capturas && d.capturas.length > 0) {
        const especiesList = [];
        const detalhesList = [];
        
        d.capturas.forEach(c => {
            // Melhorar exibição do nome da espécie
            let especieNome = '';
            if (c.especie?.nome_popular) {
                especieNome = c.especie.nome_popular;
                if (c.especie.nome_cientifico) {
                    especieNome += ` (${c.especie.nome_cientifico})`;
                }
            } else if (c.especie?.nome_cientifico) {
                especieNome = c.especie.nome_cientifico;
            } else {
                especieNome = `Espécie ID #${c.ID_especie}`;
            }
            
            especiesList.push(especieNome.replace(/;/g, ','));
            
            // Detalhes da captura
            let detalhes = `${especieNome}: ${c.peso_kg || 0}kg`;
            if (c.preco_kg) detalhes += ` × R$${c.preco_kg}/kg`;
            if (c.preco_total) detalhes += ` = R$${c.preco_total}`;
            
            detalhesList.push(detalhes.replace(/;/g, ','));
        });
        
        especiesCapturadas = especiesList.join(' | ');
        detalhesCaptura = detalhesList.join(' | ');
    }

    // Agrupar indivíduos (Biometria)
    let individuosBiometria = '';
    if (d.individuos && d.individuos.length > 0) {
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

    // Criar linha única por desembarque
    const linha = [
        d.cod_desembarque || '',
        dataFormatada,
        municipio,
        localidade,
        pescador,
        cpf,
        embarcacao,
        codigoEmb,
        proprietario,
        cpfProprietario,
        d.numero_tripulantes || '0',
        d.lat_ida || '',
        d.long_ida || '',
        d.lat_volta || '',
        d.long_volta || '',
        especiesCapturadas,
        detalhesCaptura,
        individuosBiometria,
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

    // Criar blob e link para download
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
    if (!confirm('Tem certeza que deseja excluir este desembarque? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      await api.deletarDesembarque(params.id);
      router.push('/meus-desembarques');
    } catch (error) {
      console.error('Erro ao excluir desembarque:', error);
      setErro(error.message || 'Erro ao excluir desembarque');
      setLoading(false);
    }
  };

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
                <button
                  onClick={() => carregarDesembarque()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => router.push('/meus-desembarques')}
                  className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Voltar para Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !erro && desembarque && (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 mb-6 print:shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {desembarque.cod_desembarque}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {desembarque.municipio} - {desembarque.localidade}
              </p>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-3 print:hidden">
              <button
                onClick={() => router.push('/meus-desembarques')}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>←</span> Voltar
              </button>
              <button
                onClick={handleImprimir}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🖨️</span> Imprimir
              </button>
              <button
                onClick={handleExportar}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>📥</span> Exportar
              </button>
              {usuario?.funcao === 'Administrador' && (
                <>
                  <button
                    onClick={() => router.push(`/desembarque?edit=${params.id}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> Editar
                  </button>
                  <button
                    onClick={handleExcluir}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>🗑️</span> Excluir
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-brand/10 dark:bg-brand/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Valor Total</p>
              <p className="text-2xl font-bold text-brand dark:text-brand-light">
                {formatarMoeda(desembarque.total_desembarque)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Espécies</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {desembarque.estatisticas?.total_especies || 0}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Peso Total</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatarPeso(desembarque.estatisticas?.peso_total_kg)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Indivíduos</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {desembarque.estatisticas?.total_individuos_medidos || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados da Viagem */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🚢</span> Dados da Viagem
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Data da Coleta:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatarData(desembarque.data_coleta)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Data/Hora Saída:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatarDataHora(desembarque.data_saida)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Data/Hora Chegada:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatarDataHora(desembarque.data_chegada)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Tripulantes:</span>
                <span className="font-medium text-gray-900 dark:text-white">{desembarque.numero_tripulantes || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Pesqueiros:</span>
                <span className="font-medium text-gray-900 dark:text-white">{desembarque.pesqueiros || '-'}</span>
              </div>
              {(desembarque.lat_ida || desembarque.long_ida) && (
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Coordenadas Ida:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {Number(desembarque.lat_ida)?.toFixed(6)}, {Number(desembarque.long_ida)?.toFixed(6)}
                  </span>
                </div>
              )}
              {(desembarque.lat_volta || desembarque.long_volta) && (
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Coordenadas Volta:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {Number(desembarque.lat_volta)?.toFixed(6)}, {Number(desembarque.long_volta)?.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pescador */}
          {desembarque.pescador && (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>👤</span> Pescador
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Nome:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{desembarque.pescador.nome}</span>
                </div>
                {desembarque.pescador.apelido && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">Apelido:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.pescador.apelido}</span>
                  </div>
                )}
                {desembarque.pescador.cpf && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">CPF:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.pescador.cpf}</span>
                  </div>
                )}
                {desembarque.pescador.rgp && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">RGP:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.pescador.rgp}</span>
                  </div>
                )}
                {desembarque.pescador.nascimento && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">Nascimento:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatarData(desembarque.pescador.nascimento)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Embarcação */}
          {desembarque.embarcacao && (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>⛵</span> Embarcação
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Nome:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.nome_embarcacao}</span>
                </div>
                {desembarque.embarcacao.codigo_embarcacao && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">Código:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.codigo_embarcacao}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Tipo:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{desembarque.embarcacao.tipo || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Comprimento:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.comprimento ? `${desembarque.embarcacao.comprimento} m` : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Potência:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.hp ? `${desembarque.embarcacao.hp} HP` : '-'}</span>
                </div>
                {desembarque.embarcacao.proprietario && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">Proprietário:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.proprietario}</span>
                  </div>
                )}
                {desembarque.embarcacao.cpf_proprietario && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">CPF Proprietário:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.cpf_proprietario}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artes de Pesca */}
          {desembarque.artes && desembarque.artes.length > 0 && (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🎣</span> Artes de Pesca
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arte</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tamanho</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {desembarque.artes.map((arte, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white capitalize">{arte.arte?.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{arte.tamanho || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{arte.unidade || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Despesas e Destino */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 mt-6 print:shadow-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>💰</span> Despesas e Destino
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-1">Combustível</h3>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tipo:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {desembarque.desp_diesel ? 'Diesel' : desembarque.desp_gasolina ? 'Gasolina' : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Quantidade:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {desembarque.litros ? `${desembarque.litros} L` : '-'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-1">Outros Custos</h3>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Gelo:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {desembarque.gelo_kg ? `${desembarque.gelo_kg} kg` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Rancho:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatarMoeda(desembarque.rancho_valor)}
                </span>
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-1">Destino do Pescado</h3>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Destino:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {desembarque.destino_pescado || '-'}
                </span>
              </div>
              {desembarque.destino_apelido && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Comprador (Apelido):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {desembarque.destino_apelido}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Capturas */}
        {desembarque.capturas && desembarque.capturas.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 mt-6 print:shadow-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🐟</span> Espécies Capturadas
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Espécie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nome Científico
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Peso (kg)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Preço/kg
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                  {desembarque.capturas.map((captura) => (
                    <tr key={captura.ID_captura} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {captura.especie?.nome_popular || 'Não identificada'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                          {captura.especie?.nome_cientifico || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatarPeso(captura.peso_kg)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatarMoeda(captura.preco_kg)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatarMoeda(captura.preco_total)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                    <td colSpan="4" className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                      Total Geral:
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                      {formatarMoeda(desembarque.total_desembarque)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Indivíduos Medidos (Biometria) */}
        {desembarque.individuos && desembarque.individuos.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 mt-6 print:shadow-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📏</span> Biometria de Indivíduos ({desembarque.individuos.length} medições)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Espécie
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comp. Total (cm)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comp. Padrão (cm)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Comp. Forquilha (cm)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Peso (g)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sexo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estádio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                  {desembarque.individuos.map((individuo, index) => (
                    <tr key={individuo.ID_individuo} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {individuo.numero_individuo || index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {individuo.especie?.nome_popular || 'Não identificada'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {individuo.comprimento_total_cm ? parseFloat(individuo.comprimento_total_cm).toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {individuo.comprimento_padrao_cm ? parseFloat(individuo.comprimento_padrao_cm).toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {individuo.comprimento_forquilha_cm ? parseFloat(individuo.comprimento_forquilha_cm).toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {individuo.peso_g ? parseFloat(individuo.peso_g).toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white uppercase">
                        {individuo.sexo || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                        {individuo.estadio_gonadal || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 mt-6 print:shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Coletor:</p>
              <p>{desembarque.coletor || '-'}</p>
              {desembarque.data_coletor && (
                <p className="text-xs">{formatarData(desembarque.data_coletor)}</p>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Revisor:</p>
              <p>{desembarque.revisor || '-'}</p>
              {desembarque.data_revisor && (
                <p className="text-xs">{formatarData(desembarque.data_revisor)}</p>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Digitador:</p>
              <p>{desembarque.digitador || '-'}</p>
              {desembarque.data_digitador && (
                <p className="text-xs">{formatarData(desembarque.data_digitador)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Botão Voltar no Final */}
        <div className="mt-6 print:hidden">
          <button
            onClick={() => router.push('/meus-desembarques')}
            className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            ← Voltar para Meus Desembarques
          </button>
        </div>
      </div>

        {/* Estilos para impressão */}
        <style jsx global>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
          }
        `}</style>
        </div>
      )}
    </ProtectedRoute>
  );
}
