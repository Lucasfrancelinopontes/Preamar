"use client";
import { createContext, useContext, useState, useCallback } from 'react';

const FormContext = createContext();

export function FormProvider({ children }) {
    const [formData, setFormData] = useState({
        // Identificador quando em edição
        ID_desembarque: null,
        codigoColeta: '',

        // Etapa 1 - Local e datas
        municipio: '',
        localidade: '',
        dataColeta: '',
        consecutivo: null,
        dataSaida: '',
        horaSaida: '',
        dataChegada: '',
        horaChegada: '',

        // Etapa 2 - Pescador
        nomePescador: '',
        apelidoPescador: '',
        cpfPescador: '',
        nascimentoPescador: '',

        // Etapa 3 - Embarcação
        nomeEmbarcacao: '',
        codigoEmbarcacao: '',
        tipoEmbarcacao: '',
        comprimento: '',
        capacidadeEstocagem: '',
        forcaMotor: '',
        armazenamento: '',
        numTripulantes: '',
        numPesqueiros: '',

        // Etapa 4 - Artes
        arteSelecionadas: [],
        arte_obs: '',

        // Coordenadas / Quadrantes
        latIda: '',
        longIda: '',
        latVolta: '',
        longVolta: '',
        quadrante1: '',
        quadrante2: '',
        quadrante3: '',

        // Etapa 5 - Proprietário e despesas
        nomeProprietario: '',
        apelidoProprietario: '',
        cpfProprietario: '',
        atuouNaPesca: null,
        quantidadeGelo: '',
        valorRancho: '',
        litrosCombustivel: '',
        tipoCombustivel: '',

        // Etapa 6 - Destino
        destinoPescado: '',
        apelidoDestino: '',
        outroDestino: '',

        // Etapa 7/8 - Espécies
        especiesCaptura: [],
        especiesIndividuos: []
    });

    const [errors, setErrors] = useState({});

    const updateFormData = useCallback((newData) => {
        setFormData(prevData => ({
            ...prevData,
            ...newData
        }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const addError = useCallback((field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    }, []);

    const resetForm = () => {
        setFormData({
            ID_desembarque: null,
            codigoColeta: '',
            municipio: '',
            localidade: '',
            dataColeta: '',
            consecutivo: null,
            dataSaida: '',
            horaSaida: '',
            dataChegada: '',
            horaChegada: '',
            nomePescador: '',
            apelidoPescador: '',
            cpfPescador: '',
            nascimentoPescador: '',
            nomeEmbarcacao: '',
            codigoEmbarcacao: '',
            tipoEmbarcacao: '',
            comprimento: '',
            capacidadeEstocagem: '',
            forcaMotor: '',
            armazenamento: '',
            numTripulantes: '',
            numPesqueiros: '',
            arteSelecionadas: [],
            arte_obs: '',
            latIda: '',
            longIda: '',
            latVolta: '',
            longVolta: '',
            quadrante1: '',
            quadrante2: '',
            quadrante3: '',
            nomeProprietario: '',
            apelidoProprietario: '',
            cpfProprietario: '',
            atuouNaPesca: null,
            quantidadeGelo: '',
            valorRancho: '',
            litrosCombustivel: '',
            tipoCombustivel: '',
            destinoPescado: '',
            apelidoDestino: '',
            outroDestino: '',
            especiesCaptura: [],
            especiesIndividuos: []
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