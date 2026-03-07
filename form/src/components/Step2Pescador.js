"use client";

import { useState, useEffect } from 'react';
import { useFormContext } from '@/app/contexts/FormContext';
import { validarCPF, formatarCPF } from '@/utils/validations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';
import { Input } from '@/components/ui/Input.js';
import { Label } from '@/components/ui/label.js';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert.js';
import { User } from 'lucide-react';

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

        const hasNome = !!String(formFields.nomePescador || '').trim();
        const hasApelido = !!String(formFields.apelidoPescador || '').trim();
        if (!hasNome && !hasApelido) {
            errors.nomePescador = 'Digite o nome ou apelido do pescador';
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Dados do Pescador
                </CardTitle>
                <CardDescription>
                    Informe os dados do pescador responsável pela embarcação
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="nomePescador">Nome do pescador</Label>
                        <Input
                            id="nomePescador"
                            type="text"
                            name="nomePescador"
                            value={formFields.nomePescador}
                            onChange={handleInputChange}
                            placeholder="Nome completo do pescador"
                        />
                        {fieldErrors.nomePescador && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{fieldErrors.nomePescador}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apelidoPescador">Apelido do pescador</Label>
                        <Input
                            id="apelidoPescador"
                            type="text"
                            name="apelidoPescador"
                            value={formFields.apelidoPescador}
                            onChange={handleInputChange}
                            placeholder="Apelido (opcional)"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cpfPescador">CPF (opcional)</Label>
                    <Input
                        id="cpfPescador"
                        type="text"
                        name="cpfPescador"
                        value={formFields.cpfPescador}
                        onChange={handleInputChange}
                        maxLength={14}
                        placeholder="000.000.000-00"
                    />
                    {fieldErrors.cpfPescador && (
                        <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{fieldErrors.cpfPescador}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}