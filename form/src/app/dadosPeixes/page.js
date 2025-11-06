"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from '../contexts/FormContext';
import api from '@/services/api';
import { gerarCodigoDesembarque } from '@/utils/validations';

export default function DadosPeixes() {
    const router = useRouter();
    const { formData, updateFormData, resetForm } = useFormContext();
    const [especies, setEspecies] = useState(formData.especies || [{ id: "", peso: "", preco: "" }]);
    const [especiesDisponiveis, setEspeciesDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        const carregarEspecies = async () => {
            try {
                setLoading(true);
                const data = await api.getEspecies();
                setEspeciesDisponiveis(data);
            } catch (err) {
                console.error('Erro ao carregar espécies:', err);
                setErro('Erro ao carregar lista de espécies');
            } finally {
                setLoading(false);
            }
        };

        carregarEspecies();
    }, []);

    function adicionarEspecie() {
        setEspecies((s) => [...s, { id: "", peso: "", preco: "" }]);
    }

    function removerEspecie(index) {
        setEspecies((s) => s.filter((_, i) => i !== index));
    }

    function atualizarEspecie(index, field, value) {
        setEspecies((s) => s.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
    }

    const validarEspecies = () => {
        // Filtrar apenas espécies preenchidas
        const especiesPreenchidas = especies.filter(e => e.id && e.peso);
        
        if (especiesPreenchidas.length === 0) {
            setErro('Adicione pelo menos uma espécie capturada');
            return false;
        }

        for (const especie of especiesPreenchidas) {
            if (!especie.id) {
                setErro('Selecione a espécie');
                return false;
            }
            if (!especie.peso || parseFloat(especie.peso) <= 0) {
                setErro('Peso deve ser maior que zero');
                return false;
            }
            if (especie.preco && parseFloat(especie.preco) < 0) {
                setErro('Preço não pode ser negativo');
                return false;
            }
        }

        return true;
    };

    const prepararDadosEnvio = () => {
        // Gerar código de desembarque
        const codDesembarque = gerarCodigoDesembarque(
            formData.municipio,
            formData.localidade,
            formData.data,
            formData.consecutivo
        );

            // Preparar dados do pescador
        const pescador = {
            nome: formData.nomePescador || '',
            apelido: formData.apelido || null,
            cpf: formData.cpf?.replace(/\D/g, '') || '',
            nascimento: formData.nascimento || null,
            municipio: formData.municipio
        };        // Preparar dados da embarcação
        const embarcacao = {
            nome_embarcacao: formData.nomeEmbarcacao,
            codigo_embarcacao: formData.codigoEmbarcacao,
            proprietario: formData.proprietario || formData.nomePescador,
            tipo: formData.tipoPetrecho,
            comprimento: formData.comprimento ? parseFloat(formData.comprimento) : null,
            capacidade: formData.capacidadeEstocagem ? parseFloat(formData.capacidadeEstocagem) : null,
            hp: formData.forcaMotorHP ? parseInt(formData.forcaMotorHP) : null,
            possui: formData.possui || null
        };

        // Preparar dados do desembarque
        const desembarque = {
            cod_desembarque: codDesembarque,
            municipio: formData.municipio,
            localidade: formData.localidade,
            data_coleta: formData.data,
            consecutivo: parseInt(formData.consecutivo),
            data_saida: formData.dataSaida || null,
            hora_saida: formData.horaSaida || null,
            data_chegada: formData.dataChegada || null,
            hora_desembarque: formData.horaDesembarque || null,
            numero_tripulantes: formData.numeroTripulantes ? parseInt(formData.numeroTripulantes) : null,
            pesqueiros: formData.pesqueiros || null,
            arte_obs: formData.arte_obs || null,
            quadrante1: formData.quadrante1 || null,
            quadrante2: formData.quadrante2 || null,
            quadrante3: formData.quadrante3 || null,
            origem: formData.origem || null,
            desp_diesel: Boolean(formData.desp_diesel),
            desp_gasolina: Boolean(formData.desp_gasolina),
            litros: formData.litros ? parseFloat(formData.litros) : null,
            gelo_kg: formData.geloKg ? parseFloat(formData.geloKg) : null,
            rancho: formData.ranchoValor ? parseFloat(formData.ranchoValor) : null,
            destino_pescado: formData.destinoPescado || null,
            destino_apelido: formData.destinoApelido || null,
            destino_outros_qual: formData.destinoOutrosQual || null
        };

        // Preparar artes de pesca
        const artes = formData.arteSelecionadas ? formData.arteSelecionadas.map(arte => ({
            arte: arte,
            observacao: formData.arte_obs || null
        })) : [];

        // Preparar capturas
        const capturas = especies
            .filter(e => e.id && e.peso)
            .map(especie => ({
                especie_id: especie.id,
                peso: parseFloat(especie.peso),
                preco: especie.preco ? parseFloat(especie.preco) : null
            }));

        return {
            pescador,
            embarcacao,
            desembarque,
            artes,
            capturas
        };
    };

    const calcularTotal = () => {
        return especies
            .filter(e => e.peso && e.preco)
            .reduce((total, e) => total + (parseFloat(e.peso) * parseFloat(e.preco)), 0)
            .toFixed(2);
    };

    const handleEnviar = async (e) => {
        e.preventDefault();
        
        setErro(null);
        setSucesso(false);

        // Validar espécies
        if (!validarEspecies()) {
            return;
        }

        // Atualizar espécies no contexto
        updateFormData({ especies });

        // Preparar dados para envio
        const dadosEnvio = prepararDadosEnvio();

        console.log('📤 Dados preparados para envio:', JSON.stringify(dadosEnvio, null, 2));

        try {
            setEnviando(true);
            const resultado = await api.criarDesembarque(dadosEnvio);
            
            console.log('✅ Desembarque criado com sucesso:', resultado);
            setSucesso(true);
            
            // Aguardar 2 segundos e redirecionar
            setTimeout(() => {
                resetForm();
                router.push('/sucesso');
            }, 2000);

        } catch (error) {
            // Log do erro completo para debugging
            console.error('❌ Erro ao enviar:', error);

            // Tentativa de extrair informações úteis do erro
            const errorInfo = {
                message: error?.message || 'Erro desconhecido',
                name: error?.name,
                stack: error?.stack,
                response: {
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
                    data: error?.response?.data
                }
            };

            console.error('📋 Detalhes do erro:', errorInfo);
            
            // Determinação da mensagem de erro para o usuário
            let mensagemErro = 'Erro ao enviar dados. Tente novamente.';
            
            if (error?.response?.data?.message) {
                mensagemErro = error.response.data.message;
            } else if (error?.response?.data?.error) {
                mensagemErro = error.response.data.error;
            } else if (error?.response?.data?.errors) {
                mensagemErro = Array.isArray(error.response.data.errors) 
                    ? error.response.data.errors.join(', ')
                    : error.response.data.errors;
            } else if (error?.message) {
                mensagemErro = error.message;
            }

            if (error?.response?.status === 404) {
                mensagemErro = 'Servidor não encontrado. Verifique sua conexão.';
            } else if (error?.response?.status === 500) {
                mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
            }
            
            console.error('💬 Mensagem para o usuário:', mensagemErro);
            setErro(mensagemErro);
        } finally {
            setEnviando(false);
        }
    };

    const handleVoltar = (e) => {
        e.preventDefault();
        updateFormData({ especies });
        router.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando espécies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Registro de Espécies Capturadas</h1>

                <form className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                    {/* Mensagens de Erro/Sucesso */}
                    {erro && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium">❌ {erro}</p>
                        </div>
                    )}

                    {sucesso && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 font-medium">✅ Desembarque registrado com sucesso! Redirecionando...</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {especies.map((esp, idx) => (
                            <div key={`especie-row-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Espécie {idx === 0 && <span className="text-red-500">*</span>}
                                    </label>
                                    <select
                                        value={esp.id}
                                        onChange={(e) => atualizarEspecie(idx, "id", e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        disabled={loading}
                                    >
                                        <option value="">Selecione uma espécie</option>
                                        {especiesDisponiveis.map((especie) => (
                                            <option key={`option-${especie.ID}`} value={especie.ID}>
                                                {especie.Nome_popular} ({especie.Nome_cientifico})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Peso (kg) {idx === 0 && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        value={esp.peso}
                                        onChange={(e) => atualizarEspecie(idx, "peso", e.target.value)}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">Preço / kg (R$)</label>
                                    <input
                                        value={esp.preco}
                                        onChange={(e) => atualizarEspecie(idx, "preco", e.target.value)}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    />
                                </div>

                                <div className="flex flex-col justify-end">
                                    {idx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removerEspecie(idx)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Remover
                                        </button>
                                    )}
                                    {esp.peso && esp.preco && (
                                        <div className="text-sm text-gray-600 mt-2">
                                            Total: R$ {(parseFloat(esp.peso) * parseFloat(esp.preco)).toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={adicionarEspecie}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-colors"
                            >
                                + Adicionar Espécie
                            </button>
                        </div>

                        {/* Total Geral */}
                        {especies.some(e => e.peso && e.preco) && (
                            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-800">Total do Desembarque:</span>
                                    <span className="text-2xl font-bold text-amber-600">R$ {calcularTotal()}</span>
                                </div>
                            </div>
                        )}

                        {/* Resumo dos Dados */}
                        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Resumo do Desembarque</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Município: <span className="font-medium text-gray-800">{formData.municipio}</span></p>
                                    <p className="text-gray-600">Localidade: <span className="font-medium text-gray-800">{formData.localidade}</span></p>
                                    <p className="text-gray-600">Data: <span className="font-medium text-gray-800">{formData.data}</span></p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Pescador: <span className="font-medium text-gray-800">{formData.nomePescador}</span></p>
                                    <p className="text-gray-600">Embarcação: <span className="font-medium text-gray-800">{formData.nomeEmbarcacao}</span></p>
                                    <p className="text-gray-600">Coletor: <span className="font-medium text-gray-800">{formData.coletor}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Navegação */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <button
                            onClick={handleVoltar}
                            type="button"
                            disabled={enviando}
                            className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Voltar
                        </button>
                        
                        <div className="flex gap-4">
                            {/* Botão Debug (remover em produção) */}
                            <button
                                onClick={() => {
                                    const dados = prepararDadosEnvio();
                                    console.log('🔍 Debug - Dados:', dados);
                                    alert('Dados logados no console (F12)');
                                }}
                                type="button"
                                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors font-medium"
                            >
                                🔍 Debug
                            </button>
                            
                            <button
                                onClick={handleEnviar}
                                type="button"
                                disabled={enviando || sucesso}
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {enviando ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    '✓ Finalizar e Enviar'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}