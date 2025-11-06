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
        codigoColeta: formData.codigoColeta || "",
        codigoFoto: formData.codigoFoto || "",
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
        
        if (!formFields.codigoColeta) {
            errors.codigoColeta = 'Digite o código de coleta';
        }
        
        if (!formFields.dataSaida) {
            errors.dataSaida = 'Selecione a data de saída';
        }
        
        if (!formFields.dataChegada) {
            errors.dataChegada = 'Selecione a data de chegada';
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
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Município*
                </label>
                <select
                    name="municipio"
                    value={formFields.municipio}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${
                        temaEscuro ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
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
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.municipio}</p>
                )}
            </div>

            {/* Localidade */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Localidade*
                </label>
                <select
                    name="localidade"
                    value={formFields.localidade}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${
                        temaEscuro ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
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
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.localidade}</p>
                )}
            </div>

            {/* Código de Coleta */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Código de coleta*
                </label>
                <input
                    type="text"
                    name="codigoColeta"
                    value={formFields.codigoColeta}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${
                        temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                    placeholder="Digite o código de coleta"
                />
                {fieldErrors.codigoColeta && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.codigoColeta}</p>
                )}
            </div>

            {/* Código da Foto */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Código da foto
                </label>
                <input
                    type="text"
                    name="codigoFoto"
                    value={formFields.codigoFoto}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${
                        temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                    placeholder="Digite o código da foto (opcional)"
                />
            </div>

            {/* Data de Saída */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data de saída*
                </label>
                <input
                    type="datetime-local"
                    name="dataSaida"
                    value={formFields.dataSaida}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${
                        temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                />
                {fieldErrors.dataSaida && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.dataSaida}</p>
                )}
            </div>

            {/* Data de Chegada */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data de chegada*
                </label>
                <input
                    type="datetime-local"
                    name="dataChegada"
                    value={formFields.dataChegada}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${
                        temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                />
                {fieldErrors.dataChegada && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.dataChegada}</p>
                )}
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={prevStep}
                    className={`flex-1 px-4 py-3 rounded-lg border ${
                        temaEscuro 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } font-medium transition-colors`}
                >
                    Voltar
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                >
                    Próximo
                </button>
            </div>
        </form>
    );
}