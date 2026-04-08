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
    const router = useRouter();
    const { login, estaAutenticado } = useAuth();

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
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
            <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-8 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            PREAMAR
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-900">
                            Entrar
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Acesse sua conta para continuar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {mostrarSenha ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {erro && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {erro}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={carregando}
                            className="flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {carregando ? (
                                <span>Entrando...</span>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}