"use client";

import { useState, useEffect } from 'react';
import { useFormContext } from '@/app/contexts/FormContext';
import api from '@/services/api';

export default function Step1Local({ nextStep, prevStep }) {
    const { formData, updateFormData } = useFormContext();
    
    const [municipios, setMunicipios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMunicipioObj, setSelectedMunicipioObj] = useState(null);
    const [temaEscuro, setTemaEscuro] = useState(false);
    
    // Campos do formulário
    const [formFields, setFormFields] = useState({
        municipio: formData.municipio || "",
        municipioCode: formData.municipioCode || "",
        localidade: formData.localidade || "",
        localidadeCode: formData.localidadeCode || "",
        consecutivo: formData.consecutivo || "",
        codigoColeta: formData.codigoColeta || "",
        codigoFoto: formData.codigoFoto || "",
        dataColeta: formData.dataColeta || "",
        dataSaida: formData.dataSaida || "",
        dataChegada: formData.dataChegada || "",
    });

    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        carregarMunicipios();
    }, []);

    useEffect(() => {
        // Quando municipio muda, encontrar o objeto correspondente
        if (formFields.municipio && municipios.length > 0) {
            const munObj = municipios.find(m => m.municipio === formFields.municipio);
            setSelectedMunicipioObj(munObj || null);
        } else {
            setSelectedMunicipioObj(null);
        }
    }, [formFields.municipio, municipios]);

    // Auto-generate codigo de coleta when components change - AGORA BASEADO NA DATA DE COLETA
    useEffect(() => {
        if (formFields.municipioCode && formFields.localidadeCode && formFields.dataColeta && formFields.consecutivo) {
            const date = new Date(formFields.dataColeta);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            const consecutivoFormatted = String(formFields.consecutivo).padStart(2, '0');
            
            const codigoGerado = `${formFields.municipioCode} ${formFields.localidadeCode} ${day} ${month} ${year} ${consecutivoFormatted}`;
            
            setFormFields(prev => ({
                ...prev,
                codigoColeta: codigoGerado
            }));
        }
    }, [formFields.municipioCode, formFields.localidadeCode, formFields.dataColeta, formFields.consecutivo]);

    const carregarMunicipios = async () => {
        try {
            const data = await api.getMunicipios();
            setMunicipios(data);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar municípios:', err);
            setError('Erro ao carregar municípios');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'municipio') {
            // Encontrar o objeto do município selecionado
            const munObj = municipios.find(m => m.municipio === value);
            setFormFields(prev => ({
                ...prev,
                municipio: value,
                municipioCode: munObj?.municipioCode || "",
                localidade: '', // Reset localidade when municipio changes
                localidadeCode: ''
            }));
        } else if (name === 'localidade') {
            // Encontrar o código da localidade selecionada
            const locObj = selectedMunicipioObj?.localidades.find(l => l.localidade === value);
            setFormFields(prev => ({
                ...prev,
                localidade: value,
                localidadeCode: locObj?.localidadeCode || ""
            }));
        } else {
            setFormFields(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpar erro do campo quando ele for alterado
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formFields.municipio) {
            errors.municipio = 'Selecione um município';
        }
        
        if (!formFields.localidade) {
            errors.localidade = 'Selecione uma localidade';
        }
        
        if (!formFields.consecutivo) {
            errors.consecutivo = 'Digite o número consecutivo';
        }
        
        if (!formFields.dataColeta) {
            errors.dataColeta = 'Selecione a data de coleta dos dados';
        }
        
        if (!formFields.dataSaida) {
            errors.dataSaida = 'Selecione a data de saída da embarcação';
        }
        
        if (!formFields.dataChegada) {
            errors.dataChegada = 'Selecione a data de chegada da embarcação';
        }

        // Validar se data de chegada é posterior à data de saída
        if (formFields.dataSaida && formFields.dataChegada) {
            const saida = new Date(formFields.dataSaida);
            const chegada = new Date(formFields.dataChegada);
            
            if (chegada < saida) {
                errors.dataChegada = 'A data de chegada deve ser posterior à data de saída';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            updateFormData(formFields);
            nextStep();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Município */}
            <div>
                <label className="label-standard">
                    Município*
                </label>
                <select
                    name="municipio"
                    value={formFields.municipio}
                    onChange={handleInputChange}
                    className="select-standard"
                    disabled={loading}
                >
                    <option value="">Selecione um município</option>
                    {municipios.map(mun => (
                        <option key={mun.municipioCode} value={mun.municipio}>
                            {mun.municipio}
                        </option>
                    ))}
                </select>
                {fieldErrors.municipio && (
                    <p className="error-message">{fieldErrors.municipio}</p>
                )}
            </div>

            {/* Localidade */}
            <div>
                <label className="label-standard">
                    Localidade*
                </label>
                <select
                    name="localidade"
                    value={formFields.localidade}
                    onChange={handleInputChange}
                    className="select-standard"
                    disabled={!selectedMunicipioObj}
                >
                    <option value="">Selecione uma localidade</option>
                    {selectedMunicipioObj?.localidades.map(loc => (
                        <option key={loc.localidadeCode} value={loc.localidade}>
                            {loc.localidade}
                        </option>
                    ))}
                </select>
                {fieldErrors.localidade && (
                    <p className="error-message">{fieldErrors.localidade}</p>
                )}
            </div>

            {/* Data de Coleta dos Dados */}
            <div>
                <label className="label-standard">
                    Data de coleta dos dados pelo coletor*
                </label>
                <input
                    type="date"
                    name="dataColeta"
                    value={formFields.dataColeta}
                    onChange={handleInputChange}
                    className="input-standard"
                />
                {fieldErrors.dataColeta && (
                    <p className="error-message">{fieldErrors.dataColeta}</p>
                )}
                <p className="helper-text">
                    Esta data será usada para gerar o código de coleta
                </p>
            </div>

            {/* Data de Saída da Embarcação */}
            <div>
                <label className="label-standard">
                    Data de saída da embarcação*
                </label>
                <input
                    type="datetime-local"
                    name="dataSaida"
                    value={formFields.dataSaida}
                    onChange={handleInputChange}
                    className="input-standard"
                />
                {fieldErrors.dataSaida && (
                    <p className="error-message">{fieldErrors.dataSaida}</p>
                )}
            </div>

            {/* Data de Chegada da Embarcação */}
            <div>
                <label className="label-standard">
                    Data de chegada da embarcação*
                </label>
                <input
                    type="datetime-local"
                    name="dataChegada"
                    value={formFields.dataChegada}
                    onChange={handleInputChange}
                    className="input-standard"
                />
                {fieldErrors.dataChegada && (
                    <p className="error-message">{fieldErrors.dataChegada}</p>
                )}
            </div>

            {/* Número Consecutivo */}
            <div>
                <div className="alert-info">
                    <p>
                        ℹ️ O formulário monta automaticamente o código de coleta baseado no município, localidade, <strong>data de coleta dos dados</strong> e número consecutivo.
                    </p>
                </div>
                <label className="label-standard">
                    Número Consecutivo*
                </label>
                <input
                    type="number"
                    name="consecutivo"
                    value={formFields.consecutivo}
                    onChange={handleInputChange}
                    className="input-standard"
                    placeholder="Digite o número consecutivo (ex: 1, 2, 3...)"
                    min="1"
                />
                {fieldErrors.consecutivo && (
                    <p className="error-message">{fieldErrors.consecutivo}</p>
                )}
            </div>

            {/* Código de Coleta (gerado automaticamente) */}
            {formFields.codigoColeta && (
                <div>
                    <label className="label-standard">
                        Código de coleta (gerado automaticamente)
                    </label>
                    <div className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 font-mono font-semibold text-lg text-brand">
                        {formFields.codigoColeta}
                    </div>
                </div>
            )}

            {/* Código da Foto */}
            <div>
                <label className="label-standard">
                    Código da foto
                </label>
                <input
                    type="text"
                    name="codigoFoto"
                    value={formFields.codigoFoto}
                    onChange={handleInputChange}
                    className="input-standard"
                    placeholder="Digite o código da foto (opcional)"
                />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary flex-1"
                >
                    Voltar
                </button>
                <button
                    type="submit"
                    className="btn-primary flex-1"
                >
                    Próximo
                </button>
            </div>
        </form>
    );
}