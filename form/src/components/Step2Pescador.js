"use client";

import { useState, useEffect } from 'react';
import { useFormContext } from '@/app/contexts/FormContext';
import { validarCPF, formatarCPF } from '@/utils/validations';

export default function Step2Pescador({ nextStep, prevStep }) {
    const { formData, updateFormData } = useFormContext();
    const [temaEscuro, setTemaEscuro] = useState(false);
    
    const [formFields, setFormFields] = useState({
        nomePescador: formData.nomePescador || '',
        apelidoPescador: formData.apelidoPescador || '',
        cpfPescador: formData.cpfPescador || ''
    });

    const [fieldErrors, setFieldErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Aplicar máscara de CPF
        if (name === 'cpfPescador') {
            newValue = formatarCPF(value);
        }

        setFormFields(prev => ({
            ...prev,
            [name]: newValue
        }));

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
        
        if (!formFields.nomePescador) {
            errors.nomePescador = 'Digite o nome do pescador';
        }
        
        // CPF agora é opcional
        if (formFields.cpfPescador && !validarCPF(formFields.cpfPescador)) {
            errors.cpfPescador = 'CPF inválido';
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
            {/* Nome do Pescador */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nome do pescador*
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        name="nomePescador"
                        value={formFields.nomePescador}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                        } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                        placeholder="Nome completo do pescador"
                    />
                </div>
                {fieldErrors.nomePescador && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.nomePescador}</p>
                )}
            </div>

            {/* Apelido do Pescador */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    Apelido do pescador
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        name="apelidoPescador"
                        value={formFields.apelidoPescador}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                        } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                        placeholder="Apelido (opcional)"
                    />
                </div>
            </div>

            {/* CPF do Pescador */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                    CPF (opcional)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        name="cpfPescador"
                        value={formFields.cpfPescador}
                        onChange={handleInputChange}
                        maxLength={14}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                        } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                        placeholder="000.000.000-00"
                    />
                </div>
                {fieldErrors.cpfPescador && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors.cpfPescador}</p>
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