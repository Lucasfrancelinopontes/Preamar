"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [novoUsuario, setNovoUsuario] = useState({
        nome: '',
        email: '',
        senha: '',
        funcao: 'Coletor'
    });

    const router = useRouter();
    const { token, ehAdmin, estaAutenticado } = useAuth();

    // Verificar permissões
    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login');
            return;
        }

        if (!ehAdmin()) {
            router.push('/');
            return;
        }

        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        try {
            setCarregando(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${apiUrl}/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setUsuarios(data.data);
            } else {
                setErro(data.message || 'Erro ao carregar usuários');
            }
        } catch (error) {
            console.error('Erro:', error);
            setErro(error.message || 'Erro ao carregar usuários');
        } finally {
            setCarregando(false);
        }
    };

    const handleCriarUsuario = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        // Validações
        if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
            setErro('Preencha todos os campos obrigatórios');
            return;
        }

        if (novoUsuario.senha.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(novoUsuario)
            });

            const data = await response.json();

            if (response.ok) {
                setSucesso('Usuário criado com sucesso!');
                setMostrarModal(false);
                setNovoUsuario({
                    nome: '',
                    email: '',
                    senha: '',
                    funcao: 'Coletor'
                });
                carregarUsuarios();
            } else {
                setErro(data.message || 'Erro ao criar usuário');
            }
        } catch (error) {
            console.error('Erro:', error);
            setErro('Erro ao criar usuário');
        }
    };

    const handleEditarUsuario = (usuario) => {
        setUsuarioEditando({ ...usuario });
        setMostrarModalEdicao(true);
        setErro('');
        setSucesso('');
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        try {
            const response = await fetch(`http://localhost:3001/api/usuarios/${usuarioEditando.ID_usuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: usuarioEditando.nome,
                    email: usuarioEditando.email,
                    funcao: usuarioEditando.funcao,
                    ativo: usuarioEditando.ativo
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSucesso('Usuário atualizado com sucesso!');
                setMostrarModalEdicao(false);
                setUsuarioEditando(null);
                carregarUsuarios();
            } else {
                setErro(data.message || 'Erro ao atualizar usuário');
            }
        } catch (error) {
            console.error('Erro:', error);
            setErro('Erro ao atualizar usuário');
        }
    };

    const handleDeletarUsuario = async (id, nome) => {
        if (!confirm(`Tem certeza que deseja deletar o usuário "${nome}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSucesso('Usuário deletado com sucesso!');
                carregarUsuarios();
            } else {
                setErro(data.message || 'Erro ao deletar usuário');
            }
        } catch (error) {
            console.error('Erro:', error);
            setErro('Erro ao deletar usuário');
        }
    };

    const getFuncaoBadgeColor = (funcao) => {
        const cores = {
            'Administrador': 'bg-purple-100 text-purple-800 border-purple-200',
            'Coletor': 'bg-blue-100 text-blue-800 border-blue-200',
            'Revisor': 'bg-green-100 text-green-800 border-green-200',
            'Digitador': 'bg-amber-100 text-amber-800 border-amber-200'
        };
        return cores[funcao] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (carregando) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
                            <p className="text-gray-600 mt-1">Administração de usuários do sistema</p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            ← Voltar ao Início
                        </button>
                    </div>
                </div>

                {/* Mensagens */}
                {erro && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {erro}
                        </p>
                    </div>
                )}

                {sucesso && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {sucesso}
                        </p>
                    </div>
                )}

                {/* Botão Novo Usuário */}
                <div className="mb-6">
                    <button
                        onClick={() => setMostrarModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Novo Usuário
                    </button>
                </div>

                {/* Tabela de Usuários */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nome</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Função</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((usuario) => (
                                    <tr key={usuario.ID_usuario} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{usuario.nome}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getFuncaoBadgeColor(usuario.funcao)}`}>
                                                {usuario.funcao}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditarUsuario(usuario)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors mr-3"
                                                title="Editar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeletarUsuario(usuario.ID_usuario, usuario.nome)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Excluir"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Criar Usuário */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Usuário</h2>

                        <form onSubmit={handleCriarUsuario} className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome Completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={novoUsuario.nome}
                                    onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nome completo"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={novoUsuario.email}
                                    onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Senha <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={novoUsuario.senha}
                                    onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            {/* Função */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Função <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={novoUsuario.funcao}
                                    onChange={(e) => setNovoUsuario({...novoUsuario, funcao: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Coletor">Coletor</option>
                                    <option value="Revisor">Revisor</option>
                                    <option value="Digitador">Digitador</option>
                                </select>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarModal(false);
                                        setErro('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Criar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Editar Usuário */}
            {mostrarModalEdicao && usuarioEditando && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h2>

                        <form onSubmit={handleSalvarEdicao} className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome Completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={usuarioEditando.nome}
                                    onChange={(e) => setUsuarioEditando({...usuarioEditando, nome: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nome completo"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={usuarioEditando.email}
                                    onChange={(e) => setUsuarioEditando({...usuarioEditando, email: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            {/* Função */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Função <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={usuarioEditando.funcao}
                                    onChange={(e) => setUsuarioEditando({...usuarioEditando, funcao: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Coletor">Coletor</option>
                                    <option value="Revisor">Revisor</option>
                                    <option value="Digitador">Digitador</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={usuarioEditando.ativo}
                                            onChange={() => setUsuarioEditando({...usuarioEditando, ativo: true})}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Ativo</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!usuarioEditando.ativo}
                                            onChange={() => setUsuarioEditando({...usuarioEditando, ativo: false})}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span>Inativo</span>
                                    </label>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarModalEdicao(false);
                                        setUsuarioEditando(null);
                                        setErro('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}