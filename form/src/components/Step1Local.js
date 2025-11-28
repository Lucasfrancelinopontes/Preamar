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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6 rounded-lg shadow-sm'>
            <h2 className='text-xl font-bold text-gray-800 border-b pb-2 mb-4'>Local e Identificação</h2>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                    <label className='block text-sm font-medium text-gray-700'>Município *</label>
                    <select
                        {...register('municipio')}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                        <option value=''>Selecione...</option>
                        {municipios.map(m => (
                            <option key={m.municipioCode} value={m.municipio}>{m.municipio}</option>
                        ))}
                    </select>
                    {errors.municipio && <p className='text-red-500 text-sm'>{errors.municipio.message}</p>}
                </div>

                <div className='space-y-1'>
                    <label className='block text-sm font-medium text-gray-700'>Localidade *</label>
                    <select
                        {...register('localidade')}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        disabled={!selectedMunicipio}
                    >
                        <option value=''>Selecione...</option>
                        {selectedMunicipioObj?.localidades.map(l => (
                            <option key={l.localidadeCode} value={l.localidade}>{l.localidade}</option>
                        ))}
                    </select>
                    {errors.localidade && <p className='text-red-500 text-sm'>{errors.localidade.message}</p>}
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                    label='Data de Coleta *'
                    type='date'
                    {...register('dataColeta')}
                    error={errors.dataColeta?.message}
                />
                
                <Input
                    label='Número Consecutivo *'
                    type='number'
                    min='1'
                    {...register('consecutivo')}
                    error={errors.consecutivo?.message}
                />
            </div>

            {codigoColeta && (
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-md'>
                    <p className='text-sm text-blue-600 font-semibold'>Código de Coleta Gerado:</p>
                    <p className='text-lg font-mono text-blue-800'>{codigoColeta}</p>
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                    label='Data/Hora Saída *'
                    type='datetime-local'
                    {...register('dataSaida')}
                    error={errors.dataSaida?.message}
                />
                
                <Input
                    label='Data/Hora Chegada *'
                    type='datetime-local'
                    {...register('dataChegada')}
                    error={errors.dataChegada?.message}
                />
            </div>

            <Input
                label='Código da Foto'
                {...register('codigoFoto')}
                placeholder='Opcional'
            />

            <div className='flex justify-end pt-4'>
                <Button type='submit'>
                    Próximo
                </Button>
            </div>
        </form>
    );
}