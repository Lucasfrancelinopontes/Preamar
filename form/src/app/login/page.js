'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '../contexts/AuthContext';
import { validarEmail } from '@/utils/validations';

function LogoMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 8c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 16c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-dark-bg dark:text-white">
      <div className="w-full max-w-md">
        <header className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
            <LogoMark className="h-9 w-9 text-brand-light" />
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Preamar</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Sistema de Gestão Pesqueira
          </p>
        </header>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 dark:bg-dark-surface dark:ring-dark-border sm:p-8">
          <h2 className="text-lg font-semibold">Entrar</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Digite suas credenciais para acessar o sistema
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="block w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-white/10"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="senha" className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-white/10"
              />
            </div>

            {erro && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex w-full items-center justify-center rounded-md bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              {carregando ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  <span className="ml-2">Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
