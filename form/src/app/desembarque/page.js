"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormContext } from '@/app/contexts/FormContext';
import api from '@/services/api';
import Step1Local from '@/components/Step1Local';
import Step2Pescador from '@/components/Step2Pescador';
import Step3Embarcacao from '@/components/Step3Embarcacao';
import Step4ArtesPesca from '@/components/Step4ArtesPesca';
import Step5ProprietarioDespesas from '@/components/Step5ProprietarioDespesas';
import Step6QuadrantesDestino from '@/components/Step6QuadrantesDestino';
import Step7EspeciesCaptura from '@/components/Step7EspeciesCaptura';
import Step8EspeciesIndividuos from '@/components/Step8EspeciesIndividuos';
import Step9ResumoAnexos from '@/components/Step9ResumoAnexos';

function DesembarqueContent() {
    const [step, setStep] = useState(1);
    const [temaEscuro, setTemaEscuro] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const { formData, updateFormData } = useFormContext();

    useEffect(() => {
        if (editId) {
            carregarDadosEdicao(editId);
        }
    }, [editId]);

    const carregarDadosEdicao = async (id) => {
        try {
            const response = await api.getDesembarque(id);
            if (response.success) {
                const data = response.data;
                
                // Helper for coordinates
                const toDMS = (val) => {
                    if (!val) return { deg: '', min: '', sec: '' };
                    const d = Math.abs(Number(val));
                    const deg = Math.floor(d);
                    const minFloat = (d - deg) * 60;
                    const min = Math.floor(minFloat);
                    const sec = Math.round((minFloat - min) * 60);
                    return { deg: String(deg), min: String(min), sec: String(sec) };
                };

                const latIda = toDMS(data.lat_ida);
                const longIda = toDMS(data.long_ida);
                const latVolta = toDMS(data.lat_volta);
                const longVolta = toDMS(data.long_volta);

                // Map Captures
                const especiesCaptura = data.capturas?.map(c => ({
                    id: c.ID_especie,
                    peso: c.peso_kg,
                    preco: c.preco_kg,
                    comTripa: c.com_tripa
                })) || [];

                // Map Individuals
                const individuosByEspecie = {};
                data.individuos?.forEach(ind => {
                    if (!individuosByEspecie[ind.ID_especie]) {
                        individuosByEspecie[ind.ID_especie] = [];
                    }
                    individuosByEspecie[ind.ID_especie].push({
                        peso: ind.peso_g,
                        comprimento: ind.comprimento_total_cm || ind.comprimento_padrao_cm
                    });
                });

                const especiesIndividuos = especiesCaptura.map(esp => ({
                    especieId: esp.id,
                    individuos: individuosByEspecie[esp.id] || []
                }));

                const mappedData = {
                    // Step 1
                    municipio: data.municipio,
                    localidade: data.localidade,
                    dataColeta: data.data_coleta ? data.data_coleta.split('T')[0] : '',
                    consecutivo: data.consecutivo,
                    codigoFoto: data.cod_foto,
                    dataSaida: data.data_saida ? data.data_saida.split('T')[0] : '',
                    dataChegada: data.data_chegada ? data.data_chegada.split('T')[0] : '',
                    
                    // Step 2
                    nomePescador: data.pescador?.nome,
                    apelidoPescador: data.pescador?.apelido,
                    cpfPescador: data.pescador?.cpf,
                    nascimento: data.pescador?.nascimento ? data.pescador.nascimento.split('T')[0] : '',

                    // Step 3
                    nomeEmbarcacao: data.embarcacao?.nome_embarcacao,
                    codigoEmbarcacao: data.embarcacao?.codigo_embarcacao,
                    tipoEmbarcacao: data.embarcacao?.tipo,
                    comprimento: data.embarcacao?.comprimento,
                    forcaMotor: data.embarcacao?.hp,
                    armazenamento: data.embarcacao?.possui,
                    capacidadeEstocagem: data.embarcacao?.capacidade,
                    numTripulantes: data.numero_tripulantes,
                    numPesqueiros: data.pesqueiros,

                    // Step 4
                    arteSelecionadas: data.artes?.map(a => ({
                        arte: a.arte,
                        tamanho: a.tamanho
                    })) || [],

                    // Step 5
                    nomeProprietario: data.proprietario || data.embarcacao?.proprietario,
                    apelidoProprietario: data.apelido_proprietario,
                    atuouNaPesca: data.atuou_pesca === 'S',
                    quantidadeGelo: data.gelo_kg,
                    valorRancho: data.rancho_valor,
                    litrosCombustivel: data.litros,
                    tipoCombustivel: data.desp_diesel ? 'Diesel' : (data.desp_gasolina ? 'Gasolina' : 'Outro'),

                    // Step 6
                    quadrante1: data.quadrante1,
                    quadrante2: data.quadrante2,
                    quadrante3: data.quadrante3,
                    destinoPescado: data.destino_pescado,
                    apelidoDestino: data.destino_apelido,
                    
                    // Coordinates
                    lat_deg1: latIda.deg, lat_min1: latIda.min, lat_sec1: latIda.sec,
                    long_deg1: longIda.deg, long_min1: longIda.min, long_sec1: longIda.sec,
                    lat_deg2: latVolta.deg, lat_min2: latVolta.min, lat_sec2: latVolta.sec,
                    long_deg2: longVolta.deg, long_min2: longVolta.min, long_sec2: longVolta.sec,

                    // Step 7 & 8
                    especiesCaptura,
                    especiesIndividuos,
                };

                updateFormData(mappedData);
            }
        } catch (error) {
            console.error("Erro ao carregar dados para edição", error);
        }
    };

    // Array de etapas para o indicador de progresso
    const steps = [
        { number: 1, title: "Dados da viagem e embarcação" },
        { number: 2, title: "Dados da viagem e embarcação" },
        { number: 3, title: "Tipo de embarcação & artes de pesca" },
        { number: 4, title: "Tipo de embarcação & artes de pesca" },
        { number: 5, title: "Proprietário & despesas" },
        { number: 6, title: "Quadrantes & destino do pescado" },
        { number: 7, title: "Espécies & pesagens - Etapa 1" },
        { number: 8, title: "Espécies & pesagens - Etapa 2" },
        { number: 9, title: "Anexos & resumo" }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, steps.length));
    const prevStep = () => {
        if (step === 1) {
            router.push('/'); // Volta para a home se estiver no primeiro passo
        } else {
            setStep(s => s - 1);
        }
    };

    // Determina a largura da barra de progresso com base na etapa atual
    const progressWidth = `${((step - 1) / (steps.length - 1)) * 100}%`;

    // Renderiza o componente da etapa atual
    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1Local nextStep={nextStep} prevStep={prevStep} />;
            case 2:
                return <Step2Pescador nextStep={nextStep} prevStep={prevStep} />;
            case 3:
                return <Step3Embarcacao nextStep={nextStep} prevStep={prevStep} />;
            case 4:
                return <Step4ArtesPesca nextStep={nextStep} prevStep={prevStep} />;
            case 5:
                return <Step5ProprietarioDespesas nextStep={nextStep} prevStep={prevStep} />;
            case 6:
                return <Step6QuadrantesDestino nextStep={nextStep} prevStep={prevStep} />;
            case 7:
                return <Step7EspeciesCaptura nextStep={nextStep} prevStep={prevStep} />;
            case 8:
                return <Step8EspeciesIndividuos nextStep={nextStep} prevStep={prevStep} />;
            case 9:
                return <Step9ResumoAnexos prevStep={prevStep} />;
            default:
                return null;
        }
    };

    return (
        <main className={`min-h-screen ${temaEscuro ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Indicador de Progresso */}
            <div className="px-4 pt-8 mb-8">
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                temaEscuro ? 'bg-teal-900 text-teal-300' : 'bg-teal-200 text-teal-600'
                            }`}>
                                Etapa {step} de {steps.length}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs font-semibold inline-block ${
                                temaEscuro ? 'text-teal-300' : 'text-teal-600'
                            }`}>
                                {Math.round((step / steps.length) * 100)}%
                            </span>
                        </div>
                    </div>
                    <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                        temaEscuro ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                        <div 
                            style={{ width: progressWidth }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500 transition-all duration-500"
                        />
                    </div>
                </div>
            </div>

            {/* Conteúdo da Etapa */}
            <div className="container mx-auto px-4 pb-12">
                {renderStep()}
            </div>
        </main>
    );
}

export default function DesembarquePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <DesembarqueContent />
        </Suspense>
    );
}