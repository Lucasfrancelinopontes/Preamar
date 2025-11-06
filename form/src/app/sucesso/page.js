"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sucesso() {
    const router = useRouter();
    const [temaEscuro, setTemaEscuro] = useState(false);

    return (
        <div className={`min-h-screen flex flex-col ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Status Bar */}
            <header className={`h-6 flex items-center justify-between px-4 text-xs ${temaEscuro ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
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
                    onClick={() => router.push('/')}
                    className={`p-2 rounded-full ${temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <svg className={`w-6 h-6 ${temaEscuro ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                </button>
                <button 
                    onClick={() => setTemaEscuro(!temaEscuro)}
                    className={`p-2 rounded-full ${temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
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
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
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
                        Os dados do desembarque foram registrados no sistema.
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                    >
                        Voltar ao Início
                    </button>

                    {/* Additional Option */}
                    <button
                        onClick={() => router.push('/desembarque')}
                        className={`w-full mt-4 px-6 py-3 rounded-lg transition-colors font-medium ${
                            temaEscuro 
                                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        Registrar Novo Desembarque
                    </button>
                </div>
            </main>
        </div>
    );
}