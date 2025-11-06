"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { 
    validarEmail, 
    validarNomeCompleto, 
    validarTelefone,
    formatarTelefone
} from '@/utils/validations';

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
    const { api } = useAuth();

    // Detectar preferência de tema do sistema
    useEffect(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTemaEscuro(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Aplicar máscara de telefone
        if (name === 'telefone') {
            newValue = formatarTelefone(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Limpar erro do campo quando ele for alterado
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

        if (!validateForm()) {
            return;
        }

        setCarregando(true);

        try {
            await api.criarUsuario({
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
                        onClick={() => router.push('/login')}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Criar Conta</h1>
                    <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                        Cadastre-se no Sistema Preamar
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome Completo */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Nome completo
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </span>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                                    temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                                placeholder="Seu nome completo"
                            />
                        </div>
                        {errors.nome && (
                            <p className="mt-2 text-sm text-red-600">{errors.nome}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                                    temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                                placeholder="seu@email.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Telefone
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                            </span>
                            <input
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                                    temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                        {errors.telefone && (
                            <p className="mt-2 text-sm text-red-600">{errors.telefone}</p>
                        )}
                    </div>

                    {/* Senha */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Senha
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                            </span>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                                    temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.senha && (
                            <p className="mt-2 text-sm text-red-600">{errors.senha}</p>
                        )}
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${temaEscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirme sua senha
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                            </span>
                            <input
                                type="password"
                                name="confirmarSenha"
                                value={formData.confirmarSenha}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                                    temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                } border focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors`}
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.confirmarSenha && (
                            <p className="mt-2 text-sm text-red-600">{errors.confirmarSenha}</p>
                        )}
                    </div>

                    {/* Erro geral */}
                    {errors.submit && (
                        <div className={`p-4 rounded-lg ${
                            temaEscuro ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'
                        }`}>
                            {errors.submit}
                        </div>
                    )}

                    {/* Botão de Cadastro */}
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
                                <span>Criando conta...</span>
                            </>
                        ) : (
                            'Criar conta'
                        )}
                    </button>

                    {/* Link para Login */}
                    <div className="text-center">
                        <p className={temaEscuro ? 'text-gray-400' : 'text-gray-600'}>
                            Já possui uma conta?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Acesse
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}