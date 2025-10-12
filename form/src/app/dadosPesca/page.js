"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormContext } from '../contexts/FormContext';
import { validarCPF, formatarCPF, validarDataSaidaChegada } from '@/utils/validations';

export default function DadosPesca() {
    const router = useRouter();
    const { formData, updateFormData, errors, addError, clearErrors } = useFormContext();
    const [artesSelecionadas, setArtesSelecionadas] = useState(formData.arteSelecionadas || []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'cpf') {
            const cpfFormatado = formatarCPF(value);
            updateFormData({ [name]: cpfFormatado });
        } else if (type === 'checkbox') {
            updateFormData({ [name]: checked });
        } else {
            updateFormData({ [name]: value });
        }
    };

    const handleArteChange = (e) => {
        const { value, checked } = e.target;
        let novasArtes;
        
        if (checked) {
            novasArtes = [...artesSelecionadas, value];
        } else {
            novasArtes = artesSelecionadas.filter(arte => arte !== value);
        }
        
        setArtesSelecionadas(novasArtes);
        updateFormData({ arteSelecionadas: novasArtes });
    };

    const validateForm = () => {
        clearErrors();
        let isValid = true;

        // Validar nome do pescador
        if (!formData.nomePescador || formData.nomePescador.trim() === '') {
            addError('nomePescador', 'Nome do pescador é obrigatório');
            isValid = false;
        }

        // Validar CPF
        if (!formData.cpf) {
            addError('cpf', 'CPF é obrigatório');
            isValid = false;
        } else if (!validarCPF(formData.cpf)) {
            addError('cpf', 'CPF inválido');
            isValid = false;
        }

        // Validar embarcação
        if (!formData.nomeEmbarcacao) {
            addError('nomeEmbarcacao', 'Nome da embarcação é obrigatório');
            isValid = false;
        }

        if (!formData.codigoEmbarcacao) {
            addError('codigoEmbarcacao', 'Código da embarcação é obrigatório');
            isValid = false;
        }

        // Validar tipo de embarcação
        if (!formData.tipoPetrecho) {
            addError('tipoPetrecho', 'Tipo de embarcação é obrigatório');
            isValid = false;
        }

        // Validar datas
        if (formData.dataSaida && formData.dataChegada) {
            if (!validarDataSaidaChegada(formData.dataSaida, formData.dataChegada)) {
                addError('dataChegada', 'Data de chegada deve ser posterior à data de saída');
                isValid = false;
            }
        }

        // Validar número de tripulantes
        if (formData.numeroTripulantes && parseInt(formData.numeroTripulantes) < 1) {
            addError('numeroTripulantes', 'Número de tripulantes deve ser maior que zero');
            isValid = false;
        }

        return isValid;
    };

    const handleBack = (e) => {
        e.preventDefault();
        router.back();
    };

    const handleNext = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            router.push('/dadosPeixes');
        } else {
            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    useEffect(() => {
        if (formData.arteSelecionadas) {
            setArtesSelecionadas(formData.arteSelecionadas);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Dados da Pesca</h1>
                
                <form className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
                    {/* Dados do Pescador */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados do Pescador</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="nomePescador" className="mb-2 text-sm font-medium text-gray-700">
                                    Nome <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    id="nomePescador" 
                                    name="nomePescador" 
                                    type="text" 
                                    placeholder="Nome completo"
                                    value={formData.nomePescador}
                                    onChange={handleInputChange}
                                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.nomePescador ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                    }`}
                                />
                                {errors.nomePescador && <span className="text-red-500 text-sm mt-1">{errors.nomePescador}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="apelido" className="mb-2 text-sm font-medium text-gray-700">Apelido</label>
                                <input 
                                    id="apelido" 
                                    name="apelido" 
                                    type="text" 
                                    placeholder="Apelido"
                                    value={formData.apelido}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="cpf" className="mb-2 text-sm font-medium text-gray-700">
                                    CPF <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    id="cpf" 
                                    name="cpf" 
                                    type="text" 
                                    placeholder="000.000.000-00"
                                    maxLength="14"
                                    value={formData.cpf}
                                    onChange={handleInputChange}
                                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.cpf ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                    }`}
                                />
                                {errors.cpf && <span className="text-red-500 text-sm mt-1">{errors.cpf}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Dados da Embarcação */}
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados da Embarcação</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                                <label htmlFor="nomeEmbarcacao" className="mb-2 text-sm font-medium text-gray-700">
                                    Nome da Embarcação <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    id="nomeEmbarcacao" 
                                    name="nomeEmbarcacao" 
                                    type="text" 
                                    placeholder="Nome da embarcação"
                                    value={formData.nomeEmbarcacao}
                                    onChange={handleInputChange}
                                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.nomeEmbarcacao ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                    }`}
                                />
                                {errors.nomeEmbarcacao && <span className="text-red-500 text-sm mt-1">{errors.nomeEmbarcacao}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="codigoEmbarcacao" className="mb-2 text-sm font-medium text-gray-700">
                                    Código da Embarcação <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    id="codigoEmbarcacao" 
                                    name="codigoEmbarcacao" 
                                    type="text" 
                                    placeholder="Ex: JP-001"
                                    value={formData.codigoEmbarcacao}
                                    onChange={handleInputChange}
                                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.codigoEmbarcacao ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                    }`}
                                />
                                {errors.codigoEmbarcacao && <span className="text-red-500 text-sm mt-1">{errors.codigoEmbarcacao}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="tipoPetrecho" className="mb-2 text-sm font-medium text-gray-700">
                                    Tipo <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="tipoPetrecho" 
                                    name="tipoPetrecho"
                                    value={formData.tipoPetrecho}
                                    onChange={handleInputChange}
                                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.tipoPetrecho ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                    }`}
                                >
                                    <option value="">Selecione</option>
                                    <option value="catraia">Catraia</option>
                                    <option value="caico">Caico</option>
                                    <option value="jangada">Jangada</option>
                                    <option value="boteLancha">Bote/Lancha</option>
                                    <option value="canoa">Canoa</option>
                                    <option value="barco">Barco</option>
                                    <option value="outro">Outro</option>
                                </select>
                                {errors.tipoPetrecho && <span className="text-red-500 text-sm mt-1">{errors.tipoPetrecho}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="comprimento" className="mb-2 text-sm font-medium text-gray-700">Comprimento (m)</label>
                                <input 
                                    id="comprimento" 
                                    name="comprimento" 
                                    type="number" 
                                    step="0.1"
                                    placeholder="Ex: 8.5"
                                    value={formData.comprimento}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="capacidadeEstocagem" className="mb-2 text-sm font-medium text-gray-700">Capacidade (kg)</label>
                                <input 
                                    id="capacidadeEstocagem" 
                                    name="capacidadeEstocagem" 
                                    type="number"
                                    placeholder="Ex: 500"
                                    value={formData.capacidadeEstocagem}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="forcaMotorHP" className="mb-2 text-sm font-medium text-gray-700">Motor (HP)</label>
                                <input 
                                    id="forcaMotorHP" 
                                    name="forcaMotorHP" 
                                    type="number"
                                    placeholder="Ex: 40"
                                    value={formData.forcaMotorHP}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="possui" className="mb-2 text-sm font-medium text-gray-700">Possui</label>
                                <select 
                                    id="possui" 
                                    name="possui"
                                    value={formData.possui}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                >
                                    <option value="">Selecione</option>
                                    <option value="urna">Urna</option>
                                    <option value="caixaTermica">Caixa Térmica</option>
                                    <option value="pescadoInNatura">Pescado in Natura</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dados da Viagem */}
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados da Viagem</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="numeroTripulantes" className="mb-2 text-sm font-medium text-gray-700">Nº Tripulantes</label>
                                <input 
                                    id="numeroTripulantes" 
                                    name="numeroTripulantes" 
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 3"
                                    value={formData.numeroTripulantes}
                                    onChange={handleInputChange}
                                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.numeroTripulantes ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                    }`}
                                />
                                {errors.numeroTripulantes && <span className="text-red-500 text-sm mt-1">{errors.numeroTripulantes}</span>}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="pesqueiros" className="mb-2 text-sm font-medium text-gray-700">Pesqueiros</label>
                                <input 
                                    id="pesqueiros" 
                                    name="pesqueiros" 
                                    type="text"
                                    placeholder="Local de pesca"
                                    value={formData.pesqueiros}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="quadrante1" className="mb-2 text-sm font-medium text-gray-700">Quadrantes</label>
                                <div className="flex gap-2">
                                    <input 
                                        name="quadrante1" 
                                        type="text"
                                        placeholder="Q1"
                                        value={formData.quadrante1}
                                        onChange={handleInputChange}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-1/3"
                                    />
                                    <input 
                                        name="quadrante2" 
                                        type="text"
                                        placeholder="Q2"
                                        value={formData.quadrante2}
                                        onChange={handleInputChange}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-1/3"
                                    />
                                    <input 
                                        name="quadrante3" 
                                        type="text"
                                        placeholder="Q3"
                                        value={formData.quadrante3}
                                        onChange={handleInputChange}
                                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-1/3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="dataSaida" className="mb-2 text-sm font-medium text-gray-700">Data Saída</label>
                                    <input 
                                        id="dataSaida" 
                                        name="dataSaida" 
                                        type="date"
                                        value={formData.dataSaida}
                                        onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="horaSaida" className="mb-2 text-sm font-medium text-gray-700">Hora Saída</label>
                                    <input 
                                        id="horaSaida" 
                                        name="horaSaida" 
                                        type="time"
                                        value={formData.horaSaida}
                                        onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="dataChegada" className="mb-2 text-sm font-medium text-gray-700">Data Chegada</label>
                                    <input 
                                        id="dataChegada" 
                                        name="dataChegada" 
                                        type="date"
                                        value={formData.dataChegada}
                                        onChange={handleInputChange}
                                        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.dataChegada ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-amber-300'
                                        }`}
                                    />
                                    {errors.dataChegada && <span className="text-red-500 text-sm mt-1">{errors.dataChegada}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="horaDesembarque" className="mb-2 text-sm font-medium text-gray-700">Hora Desembarque</label>
                                    <input 
                                        id="horaDesembarque" 
                                        name="horaDesembarque" 
                                        type="time"
                                        value={formData.horaDesembarque}
                                        onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Artes de Pesca */}
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Artes de Pesca</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                {[
                                    { value: 'rede_boirea', label: 'Rede - Boiera' },
                                    { value: 'espinhel_mergulho', label: 'Espinhel - Mergulho' },
                                    { value: 'rede_fundeio', label: 'Rede - Fundeio' },
                                    { value: 'linha_mao', label: 'Linha de Mão' },
                                    { value: 'rede_cacoaria', label: 'Rede - Caçoeira' },
                                    { value: 'covo', label: 'Covo' },
                                    { value: 'outras', label: 'Outras' }
                                ].map(arte => (
                                    <label key={arte.value} className="flex items-center gap-2 text-gray-700">
                                        <input 
                                            type="checkbox" 
                                            value={arte.value}
                                            checked={artesSelecionadas.includes(arte.value)}
                                            onChange={handleArteChange}
                                            className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300"
                                        />
                                        <span className="text-sm">{arte.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="arte_obs" className="mb-2 text-sm font-medium text-gray-700">Observações</label>
                                <textarea 
                                    id="arte_obs"
                                    name="arte_obs"
                                    rows={3}
                                    placeholder="Observações sobre as artes de pesca..."
                                    value={formData.arte_obs}
                                    onChange={handleInputChange}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Destino do Pescado */}
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Destino do Pescado</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="destinoPescado" 
                                        value="atravessador"
                                        checked={formData.destinoPescado === 'atravessador'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-amber-500 focus:ring-amber-300"
                                    />
                                    <span className="text-sm">Atravessador</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="destinoPescado" 
                                        value="armador"
                                        checked={formData.destinoPescado === 'armador'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-amber-500 focus:ring-amber-300"
                                    />
                                    <span className="text-sm">Armador</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="destinoPescado" 
                                        value="diretoConsumidor"
                                        checked={formData.destinoPescado === 'diretoConsumidor'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-amber-500 focus:ring-amber-300"
                                    />
                                    <span className="text-sm">Direto Consumidor</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="destinoPescado" 
                                        value="outros"
                                        checked={formData.destinoPescado === 'outros'}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-amber-500 focus:ring-amber-300"
                                    />
                                    <span className="text-sm">Outros</span>
                                </label>
                            </div>
                            
                            {(formData.destinoPescado === 'atravessador' || formData.destinoPescado === 'armador') && (
                                <div className="mt-4">
                                    <label className="mb-2 text-sm font-medium text-gray-700">Apelido</label>
                                    <input 
                                        name="destinoApelido"
                                        type="text"
                                        placeholder="Apelido do destinatário"
                                        value={formData.destinoApelido}
                                        onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-full"
                                    />
                                </div>
                            )}
                            
                            {formData.destinoPescado === 'outros' && (
                                <div className="mt-4">
                                    <label className="mb-2 text-sm font-medium text-gray-700">Qual?</label>
                                    <input 
                                        name="destinoOutrosQual"
                                        type="text"
                                        placeholder="Especifique o destino"
                                        value={formData.destinoOutrosQual}
                                        onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-full"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botões de Navegação */}
                    <div className="flex justify-between mt-6 pt-6 border-t">
                        <button 
                            onClick={handleBack}
                            type="button"
                            className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            ← Voltar
                        </button>
                        <button 
                            onClick={handleNext}
                            type="button"
                            className="bg-amber-500 text-white px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors font-medium"
                        >
                            Próximo →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}