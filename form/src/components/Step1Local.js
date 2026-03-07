'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '@/app/contexts/FormContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Input } from '@/components/ui/Input.js';
import { Label } from '@/components/ui/label.js';
import { Button } from '@/components/ui/Button.js';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert.js';
import { da } from 'zod/v4/locales';

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
    const router = useRouter();
    const { formData, updateFormData } = useFormContext();
    const [municipios, setMunicipios] = useState([]);
    const [selectedMunicipioObj, setSelectedMunicipioObj] = useState(null);

    const hasHydratedFromContextRef = useRef(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        getValues,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: formData 
    });

    // Estado local para código de coleta
    const [codigoColeta, setCodigoColeta] = useState(formData.codigoColeta || '');

    // Monitorar campos para lógica dependente
    const selectedMunicipio = watch('municipio');
    const selectedLocalidade = watch('localidade');
    const dataColeta = watch('dataColeta');
    const consecutivo = watch('consecutivo');

    const normalizeStr = (v) => String(v ?? '').trim().toLowerCase();

    // No modo edição, formData pode chegar depois que o componente montou.
    // Como o RHF só aplica defaultValues no mount, precisamos resetar quando os dados forem carregados.
    useEffect(() => {
        if (!formData) return;
        const isEdit = Boolean(formData.ID_desembarque);
        if (!isEdit) {
            hasHydratedFromContextRef.current = false;
            return;
        }

        const current = getValues();
        const needsHydration =
            (!current?.municipio && !!formData.municipio) ||
            (!current?.localidade && !!formData.localidade) ||
            (!current?.dataColeta && !!formData.dataColeta) ||
            (!current?.dataSaida && !!formData.dataSaida) ||
            (!current?.dataChegada && !!formData.dataChegada);

        if (!hasHydratedFromContextRef.current || needsHydration) {
            reset(formData);
            setCodigoColeta(formData.codigoColeta || '');
            hasHydratedFromContextRef.current = true;
        }
    }, [formData, getValues, reset]);

    useEffect(() => {
        api.getMunicipios().then(setMunicipios).catch(console.error);
    }, []);

    const municipioField = register('municipio');
    const localidadeField = register('localidade');

    // Ao editar: garante que o valor vindo do backend seja compatível com as opções do dropdown.
    // (Ex: diferenças de acentuação/caixa, ou usar municipioCode/localidadeCode quando disponível)
    useEffect(() => {
        if (!municipios || municipios.length === 0) return;

        const currentMunicipio = normalizeStr(selectedMunicipio);
        const currentMatches = municipios.some(m => normalizeStr(m.municipio) === currentMunicipio);

        if (!selectedMunicipio || !currentMatches) {
            let nextMunicipio = '';

            if (formData?.municipio) {
                const byName = municipios.find(m => normalizeStr(m.municipio) === normalizeStr(formData.municipio));
                if (byName) nextMunicipio = byName.municipio;
            }

            if (!nextMunicipio && formData?.municipioCode) {
                const byCode = municipios.find(m => normalizeStr(m.municipioCode) === normalizeStr(formData.municipioCode));
                if (byCode) nextMunicipio = byCode.municipio;
            }

            if (nextMunicipio) {
                setValue('municipio', nextMunicipio, { shouldValidate: true, shouldDirty: false });
            }
        }
    }, [municipios, formData?.municipio, formData?.municipioCode, selectedMunicipio, setValue]);

    // Atualizar objeto de município quando a seleção muda
    useEffect(() => {
        const mun = municipios.find(m => m.municipio === selectedMunicipio);
        setSelectedMunicipioObj(mun || null);
    }, [selectedMunicipio, municipios]);

    // Ao editar: garante que a localidade seja selecionável após o município ser resolvido.
    useEffect(() => {
        if (!selectedMunicipioObj) return;

        const localidades = Array.isArray(selectedMunicipioObj.localidades) ? selectedMunicipioObj.localidades : [];
        if (localidades.length === 0) return;

        const currentLocalidade = normalizeStr(selectedLocalidade);
        const currentMatches = localidades.some(l => normalizeStr(l.localidade) === currentLocalidade);

        if (!selectedLocalidade || !currentMatches) {
            let nextLocalidade = '';

            if (formData?.localidade) {
                const byName = localidades.find(l => normalizeStr(l.localidade) === normalizeStr(formData.localidade));
                if (byName) nextLocalidade = byName.localidade;
            }

            if (!nextLocalidade && formData?.localidadeCode) {
                const byCode = localidades.find(l => normalizeStr(l.localidadeCode) === normalizeStr(formData.localidadeCode));
                if (byCode) nextLocalidade = byCode.localidade;
            }

            if (nextLocalidade) {
                setValue('localidade', nextLocalidade, { shouldValidate: true, shouldDirty: false });
            }
        }
    }, [selectedMunicipioObj, formData?.localidade, formData?.localidadeCode, selectedLocalidade, setValue]);

    // Gerar Código de Coleta Automaticamente
    useEffect(() => {
        if (selectedMunicipioObj && selectedLocalidade && dataColeta && consecutivo) {
            const locObj = selectedMunicipioObj.localidades.find(l => l.localidade === selectedLocalidade);
            if (locObj) {
                const [yyyy, mm, dd] = String(dataColeta).split('-');
                const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
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

        const extrairHora = (datetimeLocal) => {
            if (!datetimeLocal) return '';
            const s = String(datetimeLocal);
            if (!s.includes('T')) return '';
            const time = s.split('T')[1] || '';
            return time.slice(0, 5);
        };
        
        updateFormData({
            ...data,
            municipioCode: selectedMunicipioObj?.municipioCode,
            localidadeCode: locObj?.localidadeCode,
            codigoColeta: codigoColeta,
            horaSaida: extrairHora(data.dataSaida),
            horaChegada: extrairHora(data.dataChegada)
        });
        nextStep();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                    </span>
                    Local e Identificação
                </CardTitle>
                <CardDescription>
                    Informe os dados da viagem e embarcação para identificação do desembarque
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                            <Label htmlFor="municipio">Município *</Label>
                            <Select
                                id="municipio"
                                value={selectedMunicipio || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValue('municipio', value, { shouldValidate: true, shouldDirty: false });
                                    setValue('localidade', '', { shouldValidate: true, shouldDirty: false });
                                }}
                                className="font-sans text-sm text-preamar-ocean-deep dark:text-white"
                            >
                                <option value="">Selecione um município</option>
                                {municipios.map(m => (
                                    <option key={m.municipioCode} value={m.municipio} className="text-preamar-ocean-deep dark:text-white">
                                        {m.municipio}
                                    </option>
                                ))}
                            </Select>
                        {errors.municipio && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.municipio.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="localidade">Localidade *</Label>
                        <Select
                            id="localidade"
                            value={selectedLocalidade || ''}
                            onChange={(e) => setValue('localidade', e.target.value, { shouldValidate: true, shouldDirty: false })}
                            disabled={!selectedMunicipio}
                            className="font-sans text-sm text-preamar-ocean-deep dark:text-white"
                        >
                            <option value="">Selecione uma localidade</option>
                            {selectedMunicipioObj?.localidades.map(l => (
                                <option key={l.localidadeCode} value={l.localidade} className="text-preamar-ocean-deep dark:text-white">
                                    {l.localidade}
                                </option>
                            ))}
                        </Select>
                        {/* Localidade validation present but alert suppressed to avoid duplicate inline warning */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="dataColeta">Data de Coleta *</Label>
                        <Input
                            id="dataColeta"
                            type="date"
                            {...register('dataColeta')}
                        />
                        {errors.dataColeta && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.dataColeta.message}</AlertDescription>
                            </Alert>
                        )}
                        <p className="text-sm text-gray-500">Data em que os dados foram coletados</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="consecutivo">Número Consecutivo *</Label>
                        <Input
                            id="consecutivo"
                            type="number"
                            min="1"
                            placeholder="Ex: 1, 2, 3..."
                            {...register('consecutivo')}
                        />
                        {errors.consecutivo && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.consecutivo.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                {codigoColeta && (
                    <Alert className="border-preamar-teal/20 bg-preamar-sand dark:bg-preamar-ocean-deep/20 dark:border-preamar-teal/30">
                        <CheckCircle className="h-4 w-4 text-preamar-teal" />
                        <AlertDescription className="text-preamar-ocean-deep dark:text-white">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Código de Coleta Gerado</span>
                                <span className="font-mono font-bold text-lg text-preamar-teal dark:text-preamar-teal">{codigoColeta}</span>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="dataSaida">Data/Hora Saída *</Label>
                        <Input
                            id="dataSaida"
                            type="datetime-local"
                            {...register('dataSaida')}
                        />
                        {errors.dataSaida && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.dataSaida.message}</AlertDescription>
                            </Alert>
                        )}
                        <p className="text-sm text-gray-500">Data e hora de saída da embarcação</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataChegada">Data/Hora Chegada *</Label>
                        <Input
                            id="dataChegada"
                            type="datetime-local"
                            {...register('dataChegada')}
                        />
                        {errors.dataChegada && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.dataChegada.message}</AlertDescription>
                            </Alert>
                        )}
                        <p className="text-sm text-gray-500">Data e hora de chegada da embarcação</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="codigoFoto">Código da Foto</Label>
                    <Input
                        id="codigoFoto"
                        placeholder="Digite o código da foto (opcional)"
                        {...register('codigoFoto')}
                    />
                </div>

                <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={() => router.push('/inicio')}>
                        ← Voltar para Início
                    </Button>
                    {/* O botão de avançar/navegação do wizard será mantido pelo container do wizard */}
                </div>
            </CardContent>
        </Card>
    );
}