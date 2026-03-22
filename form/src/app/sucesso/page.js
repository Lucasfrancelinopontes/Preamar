"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sucesso() {
    const router = useRouter();
    const [temaEscuro, setTemaEscuro] = useState(false);

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-md w-full text-center">
                {/* Large Check Icon */}
                <div className="mb-8 flex justify-center">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                        temaEscuro ? 'bg-green-900/30' : 'bg-green-100'
                    }`}>
                        <svg 
                            className={`w-20 h-20 ${temaEscuro ? 'text-green-400' : 'text-green-600'}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="3" 
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className={`text-3xl font-bold mb-4 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                    Cadastro enviado com sucesso!
                </h1>
                
                <p className={`text-lg mb-8 ${temaEscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                    Seus dados foram registrados com sucesso!
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                            temaEscuro 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        Ir para Home
                    </button>
                    <button
                        onClick={() => router.push('/desembarque')}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                            temaEscuro 
                                ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                                : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                        }`}
                    >
                        Novo Cadastro
                    </button>
                </div>

                {/* Theme Toggle - Positioned at bottom right */}
                <button 
                    onClick={() => setTemaEscuro(!temaEscuro)}
                    className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg ${
                        temaEscuro ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                    {temaEscuro ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}