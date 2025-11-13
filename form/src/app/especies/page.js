'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

export default function EspeciesPage() {
    const { estaAutenticado, ehAdmin } = useAuth()
    const router = useRouter()
    const [especies, setEspecies] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [modalAberto, setModalAberto] = useState(false)
    const [especieEditando, setEspecieEditando] = useState(null)
    const [busca, setBusca] = useState('')

    const [formData, setFormData] = useState({
        familia: '',
        nome_cientifico: '',
        nome_popular: '',
        genero: '',
        habitat: '',
        grau_ameaca: 'NA',
        nivel_trofico: '',
        valor_comercial: 1,
        mercado: 0,
        comprimento_max_cm: '',
        inicio_maturacao_cm: '',
        pesca: 0
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
        carregarEspecies()
    }, [estaAutenticado, ehAdmin, router])

    const carregarEspecies = async () => {
        try {
            setLoading(true)
            const response = await api.listarEspeciesAdmin()
            // Se a resposta tem a estrutura { success: true, data: [...] }
            const data = response.data || response
            setEspecies(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Erro ao carregar espécies:', error)
            setErro('Erro ao carregar espécies')
            setEspecies([]) // Definir como array vazio em caso de erro
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            familia: '',
            nome_cientifico: '',
            nome_popular: '',
            genero: '',
            habitat: '',
            grau_ameaca: 'NA',
            nivel_trofico: '',
            valor_comercial: 1,
            mercado: 0,
            comprimento_max_cm: '',
            inicio_maturacao_cm: '',
            pesca: 0
        })
        setEspecieEditando(null)
    }

    const abrirModal = (especie = null) => {
        if (especie) {
            setFormData({
                familia: especie.Familia || '',
                nome_cientifico: especie.Nome_cientifico || '',
                nome_popular: especie.Nome_popular || '',
                genero: especie.Genero || '',
                habitat: especie.Habitat || '',
                grau_ameaca: especie.Grau_de_ameaca || 'NA',
                nivel_trofico: especie.Nivel_trofico || '',
                valor_comercial: especie.Valor_comercial || 1,
                mercado: especie.Mercado || 0,
                comprimento_max_cm: especie.Comprimento_max_cm || '',
                inicio_maturacao_cm: especie.Inicio_maturacao_cm || '',
                pesca: especie.Pesca || 0
            })
            setEspecieEditando(especie)
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
            if (especieEditando) {
                // Editar espécie existente
                await api.atualizarEspecie(especieEditando.ID, formData)
                setSucesso('Espécie atualizada com sucesso!')
            } else {
                // Criar nova espécie
                await api.criarEspecie(formData)
                setSucesso('Espécie criada com sucesso!')
            }
            
            fecharModal()
            carregarEspecies()
        } catch (error) {
            console.error('Erro ao salvar espécie:', error)
            setErro('Erro ao salvar espécie: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const excluirEspecie = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta espécie?')) {
            return
        }

        try {
            await api.excluirEspecie(id)
            setSucesso('Espécie excluída com sucesso!')
            carregarEspecies()
        } catch (error) {
            console.error('Erro ao excluir espécie:', error)
            setErro('Erro ao excluir espécie: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const especiesFiltradas = especies.filter(especie =>
        especie.Nome_popular?.toLowerCase().includes(busca.toLowerCase()) ||
        especie.Nome_cientifico?.toLowerCase().includes(busca.toLowerCase()) ||
        especie.Familia?.toLowerCase().includes(busca.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Espécies</h1>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Nova Espécie
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
                        placeholder="Buscar espécies por nome popular, científico ou família..."
                        className="w-full max-w-md p-3 border rounded-lg"
                    />
                </div>

                {/* Lista de Espécies */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Carregando espécies...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome Popular
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome Científico
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Família
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Habitat
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor Comercial
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {especiesFiltradas.map((especie) => (
                                        <tr key={especie.ID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {especie.Nome_popular}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <em>{especie.Nome_cientifico}</em>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {especie.Familia}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {especie.Habitat}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {especie.Valor_comercial}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => abrirModal(especie)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => excluirEspecie(especie.ID)}
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

                        {especiesFiltradas.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {busca ? 'Nenhuma espécie encontrada para a busca.' : 'Nenhuma espécie cadastrada.'}
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
                            {especieEditando ? 'Editar Espécie' : 'Nova Espécie'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Popular *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome_popular}
                                        onChange={(e) => setFormData({...formData, nome_popular: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Científico *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome_cientifico}
                                        onChange={(e) => setFormData({...formData, nome_cientifico: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Família
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.familia}
                                        onChange={(e) => setFormData({...formData, familia: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gênero
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.genero}
                                        onChange={(e) => setFormData({...formData, genero: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Habitat
                                    </label>
                                    <select
                                        value={formData.habitat}
                                        onChange={(e) => setFormData({...formData, habitat: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Costeiro">Costeiro</option>
                                        <option value="Oceánico">Oceânico</option>
                                        <option value="Recifal">Recifal</option>
                                        <option value="oceano-recifes">Oceano-recifes</option>
                                        <option value="costeiro-oceano">Costeiro-oceano</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Grau de Ameaça
                                    </label>
                                    <select
                                        value={formData.grau_ameaca}
                                        onChange={(e) => setFormData({...formData, grau_ameaca: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value="NA">NA (Não Avaliado)</option>
                                        <option value="LC">LC (Pouco Preocupante)</option>
                                        <option value="NT">NT (Quase Ameaçado)</option>
                                        <option value="V">V (Vulnerável)</option>
                                        <option value="EN">EN (Em Perigo)</option>
                                        <option value="CR">CR (Criticamente em Perigo)</option>
                                        <option value="EX">EX (Extinto)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nível Trófico
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.nivel_trofico}
                                        onChange={(e) => setFormData({...formData, nivel_trofico: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor Comercial
                                    </label>
                                    <select
                                        value={formData.valor_comercial}
                                        onChange={(e) => setFormData({...formData, valor_comercial: parseInt(e.target.value)})}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value={1}>1 - Baixo</option>
                                        <option value={2}>2 - Médio</option>
                                        <option value={3}>3 - Alto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comprimento Máximo (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.comprimento_max_cm}
                                        onChange={(e) => setFormData({...formData, comprimento_max_cm: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Início da Maturação (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.inicio_maturacao_cm}
                                        onChange={(e) => setFormData({...formData, inicio_maturacao_cm: e.target.value})}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mercado
                                    </label>
                                    <select
                                        value={formData.mercado}
                                        onChange={(e) => setFormData({...formData, mercado: parseInt(e.target.value)})}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value={0}>Não</option>
                                        <option value={1}>Sim</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pesca Direcionada
                                    </label>
                                    <select
                                        value={formData.pesca}
                                        onChange={(e) => setFormData({...formData, pesca: parseInt(e.target.value)})}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value={0}>Não</option>
                                        <option value={1}>Sim</option>
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
                                    {especieEditando ? 'Atualizar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}