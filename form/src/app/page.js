"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
                        <h1 className="text-4xl font-bold mb-2">Sistema Preamar</h1>
                        <p className="text-xl opacity-90">Monitoramento de Desembarque de Pescado</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bem-vindo ao Sistema</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Este sistema permite o registro completo de desembarques pesqueiros, 
                                incluindo dados do pescador, embarcação, espécies capturadas e 
                                informações da viagem de pesca.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-blue-600 mb-3">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Formulário Simples</h3>
                                <p className="text-gray-600">Interface intuitiva dividida em etapas</p>
                            </div>

                            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-green-600 mb-3">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Validação Automática</h3>
                                <p className="text-gray-600">Verificação de dados em tempo real</p>
                            </div>

                            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-purple-600 mb-3">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Armazenamento Seguro</h3>
                                <p className="text-gray-600">Dados salvos em banco de dados</p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => router.push('/desembarque')}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Iniciar Novo Registro →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-600">
                    <p>Projeto Preamar - Monitoramento Pesqueiro na Paraíba</p>
                </div>
            </div>
        </div>
    );
}
