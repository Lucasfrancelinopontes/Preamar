// form/src/components/Step1Local.js
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '@/app/contexts/FormContext';
import api from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Schema de Validação (Zod)
const step1Schema = z.object({
    municipio: z.string().min(1, 'Selecione um município'),
    localidade: z.string().min(1, 'Selecione uma localidade'),
    dataColeta: z.string().min(1, 'Data de coleta é obrigatória'),
    consecutivo: z.coerce.number().min(1, 'Número consecutivo inválido'),
    codigoFoto: z.string().optional(),
    dataSaida: z.string().min(1, 'Data de saída é obrigatória'),
    dataChegada: z.string().min(1, 'Data de chegada é obrigatória'),
}).refine((data) => {
    if (data.dataSaida && data.dataChegada) {
        return new Date(data.dataChegada) >= new Date(data.dataSaida);
    }
    return true;
}, {
    message: 'A data de chegada deve ser posterior à data de saída',
    path: ['dataChegada'],
});

export default function Step1Local({ nextStep }) {
    const { formData, updateFormData } = useFormContext();
    const [municipios, setMunicipios] = useState([]);
    const [selectedMunicipioObj, setSelectedMunicipioObj] = useState(null);

    // Configuração do React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: formData // Carrega dados salvos no contexto
    });

    // Estado local para código de coleta
    const [codigoColeta, setCodigoColeta] = useState(formData.codigoColeta || '');

    // Monitorar campos para lógica dependente
    const selectedMunicipio = watch('municipio');
    const selectedLocalidade = watch('localidade');
    const dataColeta = watch('dataColeta');
    const consecutivo = watch('consecutivo');

    useEffect(() => {
        api.getMunicipios().then(setMunicipios).catch(console.error);
    }, []);

    // Atualizar objeto de município quando a seleção muda
    useEffect(() => {
        const mun = municipios.find(m => m.municipio === selectedMunicipio);
        setSelectedMunicipioObj(mun || null);
    }, [selectedMunicipio, municipios]);

    // Gerar Código de Coleta Automaticamente
    useEffect(() => {
        if (selectedMunicipioObj && selectedLocalidade && dataColeta && consecutivo) {
            const locObj = selectedMunicipioObj.localidades.find(l => l.localidade === selectedLocalidade);
            if (locObj) {
                const date = new Date(dataColeta);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                const consec = String(consecutivo).padStart(2, '0');
                
                const codigo = `${selectedMunicipioObj.municipioCode} ${locObj.localidadeCode} ${day} ${month} ${year} ${consec}`;
                setCodigoColeta(codigo);
            }
        } else {
            setCodigoColeta('');
        }
    }, [selectedMunicipioObj, selectedLocalidade, dataColeta, consecutivo]);

    const onSubmit = (data) => {
        const locObj = selectedMunicipioObj?.localidades.find(l => l.localidade === data.localidade);
        
        updateFormData({
            ...data,
            municipioCode: selectedMunicipioObj?.municipioCode,
            localidadeCode: locObj?.localidadeCode,
            codigoColeta: codigoColeta
        });
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-xl transition-all duration-300'>
            <div className='flex items-center justify-between border-b border-gray-200 dark:border-dark-border pb-4 mb-6'>
                <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>📍 Local e Identificação</h2>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Município *</label>
                    <select
                        {...register('municipio')}
                        className='w-full px-4 py-3 rounded-xl shadow-sm transition-all duration-200 bg-white dark:bg-dark-bg text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-brand focus:ring-4 focus:ring-brand/20 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed'
                    >
                        <option value=''>Selecione...</option>
                        {municipios.map(m => (
                            <option key={m.municipioCode} value={m.municipio}>{m.municipio}</option>
                        ))}
                    </select>
                    {errors.municipio && (
                        <p className='text-red-600 dark:text-red-400 text-sm mt-1.5 flex items-center gap-1'>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.municipio.message}
                        </p>
                    )}
                </div>

                <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Localidade *</label>
                    <select
                        {...register('localidade')}
                        disabled={!selectedMunicipio}
                        className='w-full px-4 py-3 rounded-xl shadow-sm transition-all duration-200 bg-white dark:bg-dark-bg text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-brand focus:ring-4 focus:ring-brand/20 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed'
                    >
                        <option value=''>Selecione...</option>
                        {selectedMunicipioObj?.localidades.map(l => (
                            <option key={l.localidadeCode} value={l.localidade}>{l.localidade}</option>
                        ))}
                    </select>
                    {errors.localidade && (
                        <p className='text-red-600 dark:text-red-400 text-sm mt-1.5 flex items-center gap-1'>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.localidade.message}
                        </p>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Input
                    label='Data de Coleta *'
                    type='date'
                    {...register('dataColeta')}
                    error={errors.dataColeta?.message}
                    helperText='Data em que os dados foram coletados'
                />
                
                <Input
                    label='Número Consecutivo *'
                    type='number'
                    min='1'
                    placeholder='Ex: 1, 2, 3...'
                    {...register('consecutivo')}
                    error={errors.consecutivo?.message}
                />
            </div>

            {codigoColeta && (
                <div className='p-6 bg-gradient-to-r from-brand/10 to-accent/10 dark:from-brand/20 dark:to-accent/20 border-2 border-brand/30 dark:border-brand/50 rounded-2xl shadow-brand'>
                    <div className='flex items-center gap-2 mb-2'>
                        <svg className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <p className='text-sm font-semibold text-brand dark:text-brand-light'>Código de Coleta Gerado</p>
                    </div>
                    <p className='text-2xl font-mono font-bold text-brand dark:text-brand-light tracking-wide'>{codigoColeta}</p>
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Input
                    label='Data/Hora Saída *'
                    type='datetime-local'
                    {...register('dataSaida')}
                    error={errors.dataSaida?.message}
                    helperText='Data e hora de saída da embarcação'
                />
                
                <Input
                    label='Data/Hora Chegada *'
                    type='datetime-local'
                    {...register('dataChegada')}
                    error={errors.dataChegada?.message}
                    helperText='Data e hora de chegada da embarcação'
                />
            </div>

            <Input
                label='Código da Foto'
                {...register('codigoFoto')}
                placeholder='Digite o código da foto (opcional)'
            />

            <div className='flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-dark-border'>
                <Button type='submit' variant='primary'>
                    Próximo →
                </Button>
            </div>
        </form>
    );
}