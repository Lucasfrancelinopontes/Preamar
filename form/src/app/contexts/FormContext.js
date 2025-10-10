"use client";
import { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export function FormProvider({ children }) {
    const [formData, setFormData] = useState({
        // Dados de desembarque
        municipio: "",
        localidade: "",
        data: "",
        consecutivo: "",
        coletor: "",
        dataC: "",
        revisor: "",
        dataR: "",
        digitador: "",
        dataD: "",
        
        // Dados do pescador
        nomePescador: "",
        apelido: "",
        cpf: "",
        nascimento: "",
        
        // Dados da embarcação
        nomeEmbarcacao: "",
        codigoEmbarcacao: "",
        tipoPetrecho: "",
        comprimento: "",
        capacidadeEstocagem: "",
        forcaMotorHP: "",
        possui: "",
        
        // Dados da pesca
        numeroTripulantes: "",
        pesqueiros: "",
        dataSaida: "",
        horaSaida: "",
        dataChegada: "",
        horaDesembarque: "",
        
        // Artes de pesca
        arteSelecionadas: [],
        arte_obs: "",
        
        // Coordenadas
        lat_deg1: "",
        lat_min1: "",
        lat_sec1: "",
        lat_deg2: "",
        lat_min2: "",
        lat_sec2: "",
        long_deg1: "",
        long_min1: "",
        long_sec1: "",
        long_deg2: "",
        long_min2: "",
        long_sec2: "",
        quadrante1: "",
        quadrante2: "",
        quadrante3: "",
        
        // Proprietário e despesas
        proprietario: "",
        apelidoProprietario: "",
        atuouPesca: "",
        origem: "",
        desp_diesel: false,
        desp_gasolina: false,
        litros: "",
        geloKg: "",
        ranchoValor: "",
        
        // Destino
        destinoPescado: "",
        destinoApelido: "",
        destinoOutrosQual: "",
        
        // Espécies capturadas
        especies: []
    });

    const [errors, setErrors] = useState({});

    const updateFormData = (newData) => {
        setFormData(prevData => ({
            ...prevData,
            ...newData
        }));
    };

    const clearErrors = () => {
        setErrors({});
    };

    const addError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };

    const resetForm = () => {
        setFormData({
            municipio: "",
            localidade: "",
            data: "",
            consecutivo: "",
            coletor: "",
            dataC: "",
            revisor: "",
            dataR: "",
            digitador: "",
            dataD: "",
            nomePescador: "",
            apelido: "",
            cpf: "",
            nascimento: "",
            nomeEmbarcacao: "",
            codigoEmbarcacao: "",
            tipoPetrecho: "",
            comprimento: "",
            capacidadeEstocagem: "",
            forcaMotorHP: "",
            possui: "",
            numeroTripulantes: "",
            pesqueiros: "",
            dataSaida: "",
            horaSaida: "",
            dataChegada: "",
            horaDesembarque: "",
            arteSelecionadas: [],
            arte_obs: "",
            lat_deg1: "",
            lat_min1: "",
            lat_sec1: "",
            lat_deg2: "",
            lat_min2: "",
            lat_sec2: "",
            long_deg1: "",
            long_min1: "",
            long_sec1: "",
            long_deg2: "",
            long_min2: "",
            long_sec2: "",
            quadrante1: "",
            quadrante2: "",
            quadrante3: "",
            proprietario: "",
            apelidoProprietario: "",
            atuouPesca: "",
            origem: "",
            desp_diesel: false,
            desp_gasolina: false,
            litros: "",
            geloKg: "",
            ranchoValor: "",
            destinoPescado: "",
            destinoApelido: "",
            destinoOutrosQual: "",
            especies: []
        });
        setErrors({});
    };

    return (
        <FormContext.Provider value={{ 
            formData, 
            updateFormData, 
            errors, 
            setErrors, 
            clearErrors, 
            addError,
            resetForm 
        }}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
}