"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../../services/api';

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
        funcao: 'Digitador'
    });

    const router = useRouter();
    const { ehAdmin, estaAutenticado } = useAuth();

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
            const data = await api.listarUsuarios();
            setUsuarios(Array.isArray(data) ? data : data.data || []);
            setErro('');
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            setErro(error.message || 'Erro ao carregar usuários');
            setUsuarios([]);
        } finally {
            setCarregando(false);
        }
    };

    const handleCriarUsuario = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
            setErro('Preencha todos os campos obrigatórios');
            return;
        }

        if (novoUsuario.senha.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            await api.criarUsuario(novoUsuario);
            setSucesso('Usuário criado com sucesso!');
            setMostrarModal(false);
            setNovoUsuario({ nome: '', email: '', senha: '', funcao: 'Digitador' });
            carregarUsuarios();
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            setErro(error.message || 'Erro ao criar usuário');
        }
    };

    const handleEditarUsuario = (usuario) => {
        setUsuarioEditando(usuario);
        setMostrarModalEdicao(true);
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        try {
            await api.atualizarUsuario(usuarioEditando.ID_usuario, {
                nome: usuarioEditando.nome,
                email: usuarioEditando.email,
                funcao: usuarioEditando.funcao,
                ativo: usuarioEditando.ativo
            });
            setSucesso('Usuário atualizado com sucesso!');
            setMostrarModalEdicao(false);
            setUsuarioEditando(null);
            carregarUsuarios();
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            setErro(error.message || 'Erro ao atualizar usuário');
        }
    };

    const handleDeletarUsuario = async (id, nome) => {
        if (!confirm(`Tem certeza que deseja deletar o usuário "${nome}"?`)) {
            return;
        }

        try {
            await api.deletarUsuario(id);
            setSucesso('Usuário deletado com sucesso!');
            setErro('');
            carregarUsuarios();
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            setErro(error.message || 'Erro ao deletar usuário');
        }
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
                            onClick={() => setMostrarModal(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            + Novo Usuário
                        </button>
                    </div>
                </div>

                {/* Mensagens */}
                {erro && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {erro}
                    </div>
                )}
                {sucesso && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                        {sucesso}
                    </div>
                )}

                {/* Tabela */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {usuarios.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Nenhum usuário cadastrado
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Função</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.ID_usuario} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{usuario.nome}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{usuario.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {usuario.funcao}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-block px-2 py-1 rounded text-xs ${usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => handleEditarUsuario(usuario)}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeletarUsuario(usuario.ID_usuario, usuario.nome)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal Criar */}
                {mostrarModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Novo Usuário</h2>
                            <form onSubmit={handleCriarUsuario}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                    <input
                                        type="text"
                                        value={novoUsuario.nome}
                                        onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={novoUsuario.email}
                                        onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                                    <input
                                        type="password"
                                        value={novoUsuario.senha}
                                        onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                                    <select
                                        value={novoUsuario.funcao}
                                        onChange={(e) => setNovoUsuario({ ...novoUsuario, funcao: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Digitador">Digitador</option>
                                        <option value="Validador">Validador</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Criar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Editar */}
                {mostrarModalEdicao && usuarioEditando && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Usuário</h2>
                            <form onSubmit={handleSalvarEdicao}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                    <input
                                        type="text"
                                        value={usuarioEditando.nome}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nome: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={usuarioEditando.email}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                                    <select
                                        value={usuarioEditando.funcao}
                                        onChange={(e) => setUsuarioEditando({ ...usuarioEditando, funcao: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Digitador">Digitador</option>
                                        <option value="Validador">Validador</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={usuarioEditando.ativo}
                                            onChange={(e) => setUsuarioEditando({ ...usuarioEditando, ativo: e.target.checked })}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Usuário Ativo</span>
                                    </label>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalEdicao(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}