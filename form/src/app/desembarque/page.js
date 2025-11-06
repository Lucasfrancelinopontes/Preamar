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
import Step7Especies from '@/components/Step7Especies';
import Step8ResumoAnexos from '@/components/Step8ResumoAnexos';

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
        { number: 7, title: "Espécies & pesagens" },
        { number: 8, title: "Anexos & resumo" }
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
                return <Step7Especies nextStep={nextStep} prevStep={prevStep} />;
            case 8:
                return <Step8ResumoAnexos prevStep={prevStep} />;
            default:
                return null;
        }
    };

    return (
        <main className={`min-h-screen flex flex-col ${temaEscuro ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Status Bar */}
            <header className={`h-6 flex items-center justify-between px-4 text-xs ${temaEscuro ? 'bg-black' : 'bg-white'}`}>
                <span>5:13 PM</span>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2M5 10h14M7 15h10"/>
                    </svg>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                </div>
            </header>

            {/* Navbar */}
            <nav className="flex items-center justify-between p-4">
                <button 
                    onClick={prevStep}
                    className={`p-2 rounded-full ${temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                </button>
                <button 
                    onClick={() => setTemaEscuro(!temaEscuro)}
                    className={`p-2 rounded-full ${temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    {temaEscuro ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                    )}
                </button>
            </nav>

            {/* Indicador de Progresso */}
            <div className="px-4 mb-8">
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
                    {step === 7 && "Registre as espécies e quantidades capturadas"}
                    {step === 8 && "Revise e confirme os dados informados"}
                </p>
            </div>

            {/* Componente da Etapa Atual */}
            <div className="flex-1 px-4 pb-4">
                {renderStep()}
            </div>
        </main>
    );
}