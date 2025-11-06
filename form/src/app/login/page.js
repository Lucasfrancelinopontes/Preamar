"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { validarEmail } from '@/utils/validations';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [temaEscuro, setTemaEscuro] = useState(false);
    const router = useRouter();
    const { login, estaAutenticado } = useAuth();

    // Detectar preferência de tema do sistema
    useEffect(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTemaEscuro(true);
        }
    }, []);

    // Redirecionar se já estiver autenticado
    useEffect(() => {
        if (estaAutenticado()) {
            router.push('/');
        }
    }, [estaAutenticado, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        // Validação básica
        if (!email || !senha) {
            setErro('Por favor, preencha todos os campos');
            setCarregando(false);
            return;
        }

        if (!validarEmail(email)) {
            setErro('Por favor, insira um email válido');
            setCarregando(false);
            return;
        }

        try {
            const resultado = await login(email, senha);
            if (resultado.success) {
                router.push('/');
            } else {
                setErro(resultado.message || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro:', error);
            setErro('Ocorreu um erro ao fazer login');
        } finally {
            setCarregando(false);
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

            <div className="flex-1 flex flex-col p-6">
                {/* Navbar */}
                <nav className="flex justify-between items-center mb-8">
                    <button 
                        onClick={() => router.push('/')}
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

                {/* Logo e Título */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-teal-600 rounded-full flex items-center justify-center">
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Sistema Preamar</h1>
                    <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                        Monitoramento de Desembarque Pesqueiro
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg ${
                                temaEscuro ? 'bg-gray-800 border-gray-700 focus:border-teal-500'
                                : 'bg-white border-gray-300 focus:border-teal-600'
                            } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg ${
                                    temaEscuro ? 'bg-gray-800 border-gray-700 focus:border-teal-500'
                                    : 'bg-white border-gray-300 focus:border-teal-600'
                                } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                                    temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                            >
                                {mostrarSenha ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {erro && (
                        <div className={`p-4 rounded-lg ${
                            temaEscuro ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'
                        }`}>
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className={`w-full py-3 rounded-lg bg-teal-600 text-white font-semibold 
                            ${carregando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'} 
                            transition-colors flex items-center justify-center gap-2`}
                    >
                        {carregando ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                <span>Entrando...</span>
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>

                    <div className="text-center">
                        <p className={temaEscuro ? 'text-gray-400' : 'text-gray-600'}>
                            Não tem uma conta?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/register')}
                                className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Criar conta
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}