'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

export default function EmbarcacoesPage() {
    const { estaAutenticado, ehAdmin } = useAuth()
    const router = useRouter()
    const [embarcacoes, setEmbarcacoes] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [modalAberto, setModalAberto] = useState(false)
    const [embarcacaoEditando, setEmbarcacaoEditando] = useState(null)
    const [busca, setBusca] = useState('')

    const [formData, setFormData] = useState({
        nome_embarcacao: '',
        codigo_embarcacao: '',
        proprietario: '',
        tipo: '',
        comprimento: '',
        capacidade: '',
        hp: '',
        possui: ''
    })

    // Verificar permissões
    useEffect(() => {
        if (!estaAutenticado()) {
            router.push('/login')
            return
        }
        if (!ehAdmin()) {
            router.push('/')
            return
        }
        carregarEmbarcacoes()
    }, [estaAutenticado, ehAdmin, router])

    const carregarEmbarcacoes = async () => {
        try {
            setLoading(true)
            const response = await api.getEmbarcacoes()
            // Se a resposta tem a estrutura { success: true, data: [...] }
            const data = response.data || response
            setEmbarcacoes(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Erro ao carregar embarcações:', error)
            setErro('Erro ao carregar embarcações')
            setEmbarcacoes([]) // Definir como array vazio em caso de erro
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            nome_embarcacao: '',
            codigo_embarcacao: '',
            proprietario: '',
            tipo: '',
            comprimento: '',
            capacidade: '',
            hp: '',
            possui: ''
        })
        setEmbarcacaoEditando(null)
    }

    const abrirModal = (embarcacao = null) => {
        if (embarcacao) {
            setFormData({
                nome_embarcacao: embarcacao.nome_embarcacao || '',
                codigo_embarcacao: embarcacao.codigo_embarcacao || '',
                proprietario: embarcacao.proprietario || '',
                tipo: embarcacao.tipo || '',
                comprimento: embarcacao.comprimento || '',
                capacidade: embarcacao.capacidade || '',
                hp: embarcacao.hp || '',
                possui: embarcacao.possui || ''
            })
            setEmbarcacaoEditando(embarcacao)
        } else {
            resetForm()
        }
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        resetForm()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro('')
        setSucesso('')

        try {
            const dadosEnvio = {
                ...formData,
                comprimento: formData.comprimento ? parseFloat(formData.comprimento) : null,
                capacidade: formData.capacidade ? parseFloat(formData.capacidade) : null,
                hp: formData.hp ? parseInt(formData.hp) : null
            }

            if (embarcacaoEditando) {
                // Editar embarcação existente
                await api.atualizarEmbarcacao(embarcacaoEditando.ID_embarcacao, dadosEnvio)
                setSucesso('Embarcação atualizada com sucesso!')
            } else {
                // Criar nova embarcação
                await api.criarEmbarcacao(dadosEnvio)
                setSucesso('Embarcação criada com sucesso!')
            }
            
            fecharModal()
            carregarEmbarcacoes()
        } catch (error) {
            console.error('Erro ao salvar embarcação:', error)
            setErro('Erro ao salvar embarcação: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const excluirEmbarcacao = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta embarcação?')) {
            return
        }

        try {
            await api.excluirEmbarcacao(id)
            setSucesso('Embarcação excluída com sucesso!')
            carregarEmbarcacoes()
        } catch (error) {
            console.error('Erro ao excluir embarcação:', error)
            setErro('Erro ao excluir embarcação: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const embarcacoesFiltradas = embarcacoes.filter(embarcacao =>
        embarcacao.nome_embarcacao?.toLowerCase().includes(busca.toLowerCase()) ||
        embarcacao.codigo_embarcacao?.toLowerCase().includes(busca.toLowerCase()) ||
        embarcacao.proprietario?.toLowerCase().includes(busca.toLowerCase()) ||
        embarcacao.tipo?.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 text-gray-600 hover:text-gray-800"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Embarcações</h1>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Nova Embarcação
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Mensagens */}
                {erro && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {erro}
                    </div>
                )}
                {sucesso && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        {sucesso}
                    </div>
                )}

                {/* Busca */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar embarcações por nome, código, proprietário ou tipo..."
                        className="w-full max-w-md p-3 border rounded-lg"
                    />
                </div>

                {/* Lista de Embarcações */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Carregando embarcações...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Proprietário
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Comprimento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            HP
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {embarcacoesFiltradas.map((embarcacao) => (
                                        <tr key={embarcacao.ID_embarcacao} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {embarcacao.nome_embarcacao}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {embarcacao.codigo_embarcacao}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {embarcacao.proprietario}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {embarcacao.tipo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {embarcacao.comprimento ? `${embarcacao.comprimento}m` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {embarcacao.hp || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => abrirModal(embarcacao)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => excluirEmbarcacao(embarcacao.ID_embarcacao)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {embarcacoesFiltradas.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {busca ? 'Nenhuma embarcação encontrada para a busca.' : 'Nenhuma embarcação cadastrada.'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalAberto && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {embarcacaoEditando ? 'Editar Embarcação' : 'Nova Embarcação'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome da Embarcação *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome_embarcacao}
                                        onChange={(e) => setFormData({...formData, nome_embarcacao: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código da Embarcação *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo_embarcacao}
                                        onChange={(e) => setFormData({...formData, codigo_embarcacao: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Ex: JP-001"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Proprietário *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.proprietario}
                                        onChange={(e) => setFormData({...formData, proprietario: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    >
                                        <option value="">Selecione o tipo</option>
                                        <option value="jangada">Jangada</option>
                                        <option value="bote">Bote</option>
                                        <option value="barco">Barco</option>
                                        <option value="traineira">Traineira</option>
                                        <option value="catraia">Catraia</option>
                                        <option value="canoa">Canoa</option>
                                        <option value="chalana">Chalana</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comprimento (metros)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.comprimento}
                                        onChange={(e) => setFormData({...formData, comprimento: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Ex: 8.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacidade de Estocagem (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.capacidade}
                                        onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Ex: 500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Força do Motor (HP)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.hp}
                                        onChange={(e) => setFormData({...formData, hp: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Ex: 40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Armazenamento
                                    </label>
                                    <select
                                        value={formData.possui}
                                        onChange={(e) => setFormData({...formData, possui: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="caixaTermica">Caixa Térmica</option>
                                        <option value="urna">Urna</option>
                                        <option value="gelo">Gelo</option>
                                        <option value="sem">Sem Armazenamento</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {embarcacaoEditando ? 'Atualizar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}