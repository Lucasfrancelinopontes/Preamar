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
        <main className={`min-h-screen flex items-center justify-center p-6 ${temaEscuro ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-md w-full">
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
                        <label className="label-standard">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-standard"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="label-standard">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="input-standard"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
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
                        <div className="alert-error">
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="btn-primary w-full"
                    >
                        {carregando ? (
                            <>
                                <span className="spinner inline-block w-5 h-5 mr-2"></span>
                                <span>Entrando...</span>
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>

                </form>
            </div>
        </main>
    );
}