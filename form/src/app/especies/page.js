'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

const ITENS_POR_PAGINA = 50

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
    const [buscaInput, setBuscaInput] = useState('') // valor do input, antes do debounce

    // Paginação vinda do servidor
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [totalEspecies, setTotalEspecies] = useState(0)

    const [formData, setFormData] = useState({
        idd: '',
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

    useEffect(() => {
        if (!estaAutenticado()) { router.push('/login'); return }
        if (!ehAdmin()) { router.push('/'); return }
    }, [estaAutenticado, ehAdmin, router])

    const carregarEspecies = useCallback(async (pagina = 1, termoBusca = '') => {
        try {
            setLoading(true)
            setErro('')
            const response = await api.listarEspeciesAdmin({
                page: pagina,
                limit: ITENS_POR_PAGINA,
                busca: termoBusca
            })

            // Suporta { data: [], pagination: { total, pages } } ou array direto
            if (response?.data && response?.pagination) {
                setEspecies(response.data)
                setTotalPaginas(response.pagination.pages || 1)
                setTotalEspecies(response.pagination.total || 0)
            } else {
                // fallback: API ainda não suporta paginação server-side
                const lista = Array.isArray(response?.data ?? response) ? (response?.data ?? response) : []
                setEspecies(lista)
                setTotalPaginas(Math.max(1, Math.ceil(lista.length / ITENS_POR_PAGINA)))
                setTotalEspecies(lista.length)
            }
        } catch (error) {
            console.error('Erro ao carregar espécies:', error)
            setErro('Erro ao carregar espécies')
            setEspecies([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Carrega quando muda página ou termo de busca
    useEffect(() => {
        carregarEspecies(paginaAtual, busca)
    }, [paginaAtual, busca, carregarEspecies])

    // Debounce no input de busca: aguarda 400ms antes de disparar
    useEffect(() => {
        const timer = setTimeout(() => {
            setPaginaAtual(1)   // volta à p.1 sempre que o filtro muda
            setBusca(buscaInput)
        }, 400)
        return () => clearTimeout(timer)
    }, [buscaInput])

    // ---------- helpers de form ----------

    const resetForm = () => {
        setFormData({
            idd: '', familia: '', nome_cientifico: '', nome_popular: '',
            genero: '', habitat: '', grau_ameaca: 'NA', nivel_trofico: '',
            valor_comercial: 1, mercado: 0, comprimento_max_cm: '',
            inicio_maturacao_cm: '', pesca: 0
        })
        setEspecieEditando(null)
    }

    const abrirModal = (especie = null) => {
        if (especie) {
            setFormData({
                idd: especie.IDD ?? especie.ID ?? '',
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

    const fecharModal = () => { setModalAberto(false); resetForm() }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro('')
        setSucesso('')
        try {
            const dadosEnvio = {
                ...formData,
                idd: formData.idd === '' ? null : parseInt(formData.idd, 10),
                nivel_trofico: formData.nivel_trofico === '' ? null : parseFloat(formData.nivel_trofico),
                valor_comercial: formData.valor_comercial === '' ? null : parseInt(formData.valor_comercial, 10),
                mercado: formData.mercado === '' ? null : parseInt(formData.mercado, 10),
                comprimento_max_cm: formData.comprimento_max_cm === '' ? null : parseFloat(formData.comprimento_max_cm),
                inicio_maturacao_cm: formData.inicio_maturacao_cm === '' ? null : parseFloat(formData.inicio_maturacao_cm),
                pesca: formData.pesca === '' ? null : parseInt(formData.pesca, 10)
            }

            if (especieEditando) {
                await api.atualizarEspecie(especieEditando.ID, dadosEnvio)
                setSucesso('Espécie atualizada com sucesso!')
            } else {
                await api.criarEspecie(dadosEnvio)
                setSucesso('Espécie criada com sucesso!')
            }
            fecharModal()
            carregarEspecies(paginaAtual, busca)
        } catch (error) {
            setErro('Erro ao salvar espécie: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const excluirEspecie = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta espécie?')) return
        try {
            await api.excluirEspecie(id)
            setSucesso('Espécie excluída com sucesso!')
            // Se era o único item da página, volta uma página
            const novaPagina = especies.length === 1 && paginaAtual > 1 ? paginaAtual - 1 : paginaAtual
            carregarEspecies(novaPagina, busca)
            setPaginaAtual(novaPagina)
        } catch (error) {
            setErro('Erro ao excluir espécie: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/')} className="p-2 text-black hover:text-black/80">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-black">Gerenciar Espécies</h1>
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
                {erro && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{erro}</div>
                )}
                {sucesso && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{sucesso}</div>
                )}

                {/* Busca */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={buscaInput}
                        onChange={(e) => setBuscaInput(e.target.value)}
                        placeholder="Buscar espécies por nome popular, científico ou família..."
                        className="w-full max-w-md p-3 border rounded-lg text-black placeholder:text-gray-500"
                    />
                </div>

                {/* Tabela */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        <p className="mt-2 text-black">Carregando espécies...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Nome Popular', 'Nome Científico', 'Família', 'Habitat', 'Valor Comercial', 'Ações'].map(h => (
                                            <th key={h} className={`px-6 py-3 text-xs font-medium text-black uppercase tracking-wider ${h === 'Ações' ? 'text-right' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {especies.map((especie) => (
                                        <tr key={especie.ID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{especie.Nome_popular}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black"><em>{especie.Nome_cientifico}</em></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{especie.Familia}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{especie.Habitat}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{especie.Valor_comercial}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => abrirModal(especie)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                                                <button onClick={() => excluirEspecie(especie.ID)} className="text-red-600 hover:text-red-900">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {totalPaginas > 1 && (
                            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600">
                                    Mostrando {indiceInicial + 1}–{Math.min(indiceInicial + especies.length, totalEspecies)} de {totalEspecies} espécies
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                                        disabled={paginaAtual <= 1}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Página {paginaAtual} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                                        disabled={paginaAtual >= totalPaginas}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}

                        {especies.length === 0 && (
                            <div className="text-center py-8 text-black">
                                {busca ? 'Nenhuma espécie encontrada para a busca.' : 'Nenhuma espécie cadastrada.'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalAberto && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-black">
                        <h2 className="text-xl font-bold text-black mb-4">
                            {especieEditando ? 'Editar Espécie' : 'Nova Espécie'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        IDD
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.idd}
                                        onChange={(e) => setFormData({ ...formData, idd: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                        placeholder="Ex.: 30002"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Nome Popular *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome_popular}
                                        onChange={(e) => setFormData({ ...formData, nome_popular: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Nome Científico *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome_cientifico}
                                        onChange={(e) => setFormData({ ...formData, nome_cientifico: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Família
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.familia}
                                        onChange={(e) => setFormData({ ...formData, familia: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Gênero
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.genero}
                                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Habitat
                                    </label>
                                    <select
                                        value={formData.habitat}
                                        onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
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
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Grau de Ameaça
                                    </label>
                                    <select
                                        value={formData.grau_ameaca}
                                        onChange={(e) => setFormData({ ...formData, grau_ameaca: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
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
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Nível Trófico
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.nivel_trofico}
                                        onChange={(e) => setFormData({ ...formData, nivel_trofico: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Valor Comercial
                                    </label>
                                    <select
                                        value={formData.valor_comercial}
                                        onChange={(e) => setFormData({ ...formData, valor_comercial: parseInt(e.target.value) })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    >
                                        <option value={1}>1 - Baixo</option>
                                        <option value={2}>2 - Médio</option>
                                        <option value={3}>3 - Alto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Comprimento Máximo (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.comprimento_max_cm}
                                        onChange={(e) => setFormData({ ...formData, comprimento_max_cm: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Início da Maturação (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.inicio_maturacao_cm}
                                        onChange={(e) => setFormData({ ...formData, inicio_maturacao_cm: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Mercado
                                    </label>
                                    <select
                                        value={formData.mercado}
                                        onChange={(e) => setFormData({ ...formData, mercado: parseInt(e.target.value) })}
                                        className="w-full p-2 border rounded-lg text-black"
                                    >
                                        <option value={0}>Não</option>
                                        <option value={1}>Sim</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Pesca Direcionada
                                    </label>
                                    <select
                                        value={formData.pesca}
                                        onChange={(e) => setFormData({ ...formData, pesca: parseInt(e.target.value) })}
                                        className="w-full p-2 border rounded-lg text-black"
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
                                    className="px-4 py-2 text-black border rounded-lg hover:bg-gray-50"
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

