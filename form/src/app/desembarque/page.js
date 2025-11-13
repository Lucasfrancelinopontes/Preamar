"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from '@/app/contexts/FormContext';
import Step1Local from '@/components/Step1Local';
import Step2Pescador from '@/components/Step2Pescador';
import Step3Embarcacao from '@/components/Step3Embarcacao';
import Step4ArtesPesca from '@/components/Step4ArtesPesca';
import Step5ProprietarioDespesas from '@/components/Step5ProprietarioDespesas';
import Step6QuadrantesDestino from '@/components/Step6QuadrantesDestino';
import Step7EspeciesCaptura from '@/components/Step7EspeciesCaptura';
import Step8EspeciesIndividuos from '@/components/Step8EspeciesIndividuos';
import Step9ResumoAnexos from '@/components/Step9ResumoAnexos';

export default function DesembarquePage() {
    const [step, setStep] = useState(1);
    const [temaEscuro, setTemaEscuro] = useState(false);
    const router = useRouter();
    const { formData } = useFormContext();

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
                <h2 className="text-xl font-bold mb-1">{steps[step - 1].title}</h2>
                <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step === 1 && "Informe os dados básicos do desembarque"}
                    {step === 2 && "Identifique o pescador responsável"}
                    {step === 3 && "Informe os dados da embarcação"}
                    {step === 4 && "Registre as artes de pesca utilizadas"}
                    {step === 5 && "Informe os dados do proprietário e despesas"}
                    {step === 6 && "Informe os quadrantes de pesca e destino do pescado"}
                    {step === 7 && "Registre as espécies e peso total capturado"}
                    {step === 8 && "Adicione dados individuais dos peixes (opcional)"}
                    {step === 9 && "Revise e confirme os dados informados"}
                </p>
            </div>

            {/* Componente da Etapa Atual */}
            <div className="flex-1 px-4 pb-4">
                {renderStep()}
            </div>
        </main>
    );
}