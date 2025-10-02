"use client";
import { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export function FormProvider({ children }) {
    const [formData, setFormData] = useState({
        municipio: "",
        localidade: "",
        data: "",
        consecutivo: "",
        coletor: "",
        dataC: "",
        revisor: "",
        dataR: "",
        digitador: "",
        dataD: ""
    });

    const updateFormData = (newData) => {
        setFormData(prevData => ({
            ...prevData,
            ...newData
        }));
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData }}>
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