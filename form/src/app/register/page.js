"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '@/services/api';
import { 
    validarEmail, 
    validarNomeCompleto, 
    validarTelefone,
    formatarTelefone
} from '@/utils/validations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LogoMark from '@/components/LogoMark';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: ''
    });

    const [errors, setErrors] = useState({});
    const [carregando, setCarregando] = useState(false);
    const [temaEscuro, setTemaEscuro] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTemaEscuro(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === 'telefone') {
            newValue = formatarTelefone(value);
        }
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nome || !validarNomeCompleto(formData.nome)) {
            newErrors.nome = 'Digite seu nome completo (nome e sobrenome)';
        }
        if (!formData.email || !validarEmail(formData.email)) {
            newErrors.email = 'Digite um email válido';
        }
        if (!formData.telefone || !validarTelefone(formData.telefone)) {
            newErrors.telefone = 'Digite um telefone válido';
        }
        if (!formData.senha || formData.senha.length < 6) {
            newErrors.senha = 'A senha deve ter no mínimo 6 caracteres';
        }
        if (!formData.confirmarSenha || formData.senha !== formData.confirmarSenha) {
            newErrors.confirmarSenha = 'As senhas não conferem';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setCarregando(true);
        try {
            await api.registrar({
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
                funcao: 'Coletor',
                telefone: formData.telefone
            });
            router.push('/login?message=Conta criada com sucesso!');
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Erro ao criar conta'
            }));
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F7F9FA] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 text-[#0B3B60] hover:text-[#00A896] mb-6 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar ao login
                </button>

                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#0B3B60] p-4 rounded-2xl">
                            <LogoMark className="w-12 h-12 text-[#00A896]" />
                        </div>
                    </div>
                    <h1 className="text-[#0B3B60] mb-2">Criar Conta</h1>
                    <p className="text-[#5A7A92]">Cadastre-se no Preamar</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 dark:bg-dark-surface dark:ring-dark-border p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-[#0B3B60]">Registro</h2>
                  <p className="mt-1 text-sm text-[#5A7A92]">
                    Preencha os dados abaixo para criar sua conta
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Nome */}
                    <div className="space-y-2">
                      <label htmlFor="nome" className="block text-sm font-medium text-[#0B3B60]">Nome Completo</label>
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        placeholder="Seu nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896]"
                        required
                      />
                      {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                    </div>
                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-[#0B3B60]">Email</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896]"
                        required
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    {/* Telefone */}
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="block text-sm font-medium text-[#0B3B60]">Telefone</label>
                      <Input
                        id="telefone"
                        name="telefone"
                        type="text"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896]"
                        required
                      />
                      {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
                    </div>
                    {/* Senhas */}
                    <div className="space-y-2">
                      <label htmlFor="senha" className="block text-sm font-medium text-[#0B3B60]">Senha</label>
                      <Input
                        id="senha"
                        name="senha"
                        type="password"
                        placeholder="••••••••"
                        value={formData.senha}
                        onChange={handleChange}
                        className="h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896]"
                        required
                      />
                      {errors.senha && <p className="text-sm text-destructive">{errors.senha}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirmarSenha" className="block text-sm font-medium text-[#0B3B60]">Confirmar Senha</label>
                      <Input
                        id="confirmarSenha"
                        name="confirmarSenha"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        className="h-12 bg-white border-[#0B3B60]/20 focus:border-[#00A896] focus:ring-[#00A896]"
                        required
                      />
                      {errors.confirmarSenha && <p className="text-sm text-destructive">{errors.confirmarSenha}</p>}
                    </div>
                    {errors.submit && (
                      <div className="text-sm text-destructive">{errors.submit}</div>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                      disabled={carregando}
                    >
                      {carregando ? 'Criando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </div>
            </div>
        </main>
    );
}