'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function DetalhesDesembarque() {
  const params = useParams();
  const router = useRouter();
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
    alert('Funcionalidade de exportar em desenvolvimento');
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
                    {desembarque.lat_ida?.toFixed(6)}, {desembarque.long_ida?.toFixed(6)}
                  </span>
                </div>
              )}
              {(desembarque.lat_volta || desembarque.long_volta) && (
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-300">Coordenadas Volta:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {desembarque.lat_volta?.toFixed(6)}, {desembarque.long_volta?.toFixed(6)}
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
                {desembarque.embarcacao.comprimento && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">Comprimento:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.comprimento} m</span>
                  </div>
                )}
                {desembarque.embarcacao.hp && (
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-300">Potência:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{desembarque.embarcacao.hp} HP</span>
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
              <div className="space-y-3">
                {desembarque.artes.map((arte, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {arte.arte?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {arte.tamanho} {arte.unidade}
                      {arte.quantidade && ` (Qtd: ${arte.quantidade})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                      Comp. (cm)
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
                        {individuo.comprimento_padrao_cm?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {individuo.peso_g?.toFixed(2) || '-'}
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
