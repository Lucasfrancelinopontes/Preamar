'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../contexts/AuthContext';
import { validarEmail } from '@/utils/validations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LogoMark from '@/components/LogoMark';

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
    <main className="min-h-screen bg-[#F7F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0B3B60] p-4 rounded-2xl">
              <LogoMark className="w-12 h-12 text-[#00A896]" />
            </div>
          </div>
          <h1 className="text-[#0B3B60] mb-2">Preamar</h1>
          <p className="text-[#5A7A92]">Sistema de Gestão Pesqueira</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 dark:bg-dark-surface dark:ring-dark-border p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0B3B60]">Entrar</h2>
          <p className="mt-1 text-sm text-[#5A7A92]">
            Digite suas credenciais para acessar o sistema
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#0B3B60]">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="text-black h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896] "
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="senha" className="block text-sm font-medium text-[#0B3B60]">
                Senha
              </label>
              <Input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="text-black h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896]"
                required
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

            <Button
              type="submit"
              className="w-full h-12 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>

          </form>
        </div>
      </div>
    </main>
  );
}
