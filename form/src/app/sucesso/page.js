"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Sucesso() {
    const router = useRouter();

    useEffect(() => {
        // Redirecionar após 5 segundos
        const timer = setTimeout(() => {
            router.push('/desembarque');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Desembarque Registrado!</h1>
                    <p className="text-lg text-gray-600">Os dados foram enviados com sucesso ao sistema.</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <p className="text-green-800 font-medium">
                        ✓ Todos os dados foram salvos no banco de dados<br/>
                        ✓ O desembarque foi registrado corretamente<br/>
                        ✓ As informações estão disponíveis para consulta
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.push('/desembarque')}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        Registrar Novo Desembarque
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Voltar ao Início
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    Redirecionando automaticamente em 5 segundos...
                </p>
            </div>
        </div>
    );
}