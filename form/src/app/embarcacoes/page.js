'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

const TIPOS_VALIDOS = ['catraia', 'caico', 'jangada', 'Bote','lancha', 'canoa', 'barco', 'outro']
const POSSUI_VALIDOS = ['urna', 'caixaTermica', 'pescadoInNatura']

const normalizarTipo = (tipo) => {
    const valor = (tipo || '').trim()
    const map = {
        bote: 'bote',
        lancha: 'lancha',
        outros: 'outro',
        traineira: 'outro',
        chalana: 'outro'
    }
    return map[valor] || valor
}

const normalizarPossui = (possui) => {
    const valor = (possui || '').trim()
    const map = {
        caixa: 'caixaTermica',
        in_natura: 'pescadoInNatura',
        gelo: '',
        sem: ''
    }
    return map[valor] ?? valor
}

const parseNumeroDecimal = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
        return null
    }

    const numero = Number(String(valor).replace(',', '.'))
    return Number.isNaN(numero) ? null : numero
}

export default function EmbarcacoesPage() {
    const { estaAutenticado, ehAdmin } = useAuth()
    const router = useRouter()
    const ITENS_POR_PAGINA = 50
    const [embarcacoes, setEmbarcacoes] = useState([])
    const [municipios, setMunicipios] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [modalAberto, setModalAberto] = useState(false)
    const [embarcacaoEditando, setEmbarcacaoEditando] = useState(null)
    const [busca, setBusca] = useState('')
    const [municipioFiltro, setMunicipioFiltro] = useState('')
    const [paginaAtual, setPaginaAtual] = useState(1)

    const [formData, setFormData] = useState({
        nome_embarcacao: '',
        codigo_embarcacao: '',
        proprietario: '',
        apelido_propietario: '',
        municipio: '',
        tipo: '',
        tipo_outro: '',
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
        carregarMunicipios()
        carregarEmbarcacoes()
    }, [estaAutenticado, ehAdmin, router])

    const carregarMunicipios = async () => {
        try {
            const response = await api.getMunicipios()
            const data = response?.data || response
            setMunicipios(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('[Embarcacoes] Erro ao carregar municípios:', error)
            setMunicipios([])
        }
    }

    const carregarEmbarcacoes = async () => {
        try {
            setLoading(true)
            console.groupCollapsed('[Embarcacoes] carregarEmbarcacoes')
            console.log('Iniciando carregamento da lista de embarcações')
            const response = await api.getEmbarcacoes()
            console.log('Resposta bruta da API:', response)
            // Se a resposta tem a estrutura { success: true, data: [...] }
            const data = response.data || response
            console.log('Payload normalizado:', data)
            console.log('Quantidade carregada:', Array.isArray(data) ? data.length : 0)
            setEmbarcacoes(Array.isArray(data) ? data : [])
            console.groupEnd()
        } catch (error) {
            console.error('[Embarcacoes] Erro ao carregar embarcações:', error)
            console.error('[Embarcacoes] Detalhes do erro ao carregar:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            })
            console.groupEnd()
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
            apelido_propietario: '',
            municipio: '',
            tipo: '',
            tipo_outro: '',
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
                apelido_propietario: embarcacao.apelido_propietario || '',
                municipio: embarcacao.municipio || '',
                tipo: embarcacao.tipo || '',
                tipo_outro: embarcacao.tipo_outro || '',
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

        let dadosEnvio = null

        try {
            const tipoNormalizado = normalizarTipo(formData.tipo)
            const possuiNormalizado = normalizarPossui(formData.possui)

            console.groupCollapsed('[Embarcacoes] handleSubmit')
            console.log('Modo:', embarcacaoEditando ? 'update' : 'create')
            console.log('FormData original:', formData)
            console.log('Tipo normalizado:', tipoNormalizado)
            console.log('Possui normalizado:', possuiNormalizado)

            if (!TIPOS_VALIDOS.includes(tipoNormalizado)) {
                console.warn('[Embarcacoes] Tipo inválido detectado:', tipoNormalizado)
                console.groupEnd()
                setErro('Tipo de embarcação inválido. Selecione uma opção válida.')
                return
            }

            if (possuiNormalizado && !POSSUI_VALIDOS.includes(possuiNormalizado)) {
                console.warn('[Embarcacoes] Armazenamento inválido detectado:', possuiNormalizado)
                console.groupEnd()
                setErro('Armazenamento inválido. Selecione uma opção válida.')
                return
            }

            dadosEnvio = {
                ...formData,
                codigo_embarcacao: formData.codigo_embarcacao?.trim() || null,
                proprietario: formData.proprietario?.trim() || null,
                tipo: tipoNormalizado,
                tipo_outro: tipoNormalizado === 'outro' ? (formData.tipo_outro?.trim() || null) : null,
                possui: possuiNormalizado || null,
                comprimento: formData.comprimento ? parseFloat(formData.comprimento) : null,
                capacidade: formData.capacidade ? parseFloat(formData.capacidade) : null,
                hp: parseNumeroDecimal(formData.hp)
            }

            console.log('Payload final enviado ao backend:', dadosEnvio)

            if (embarcacaoEditando) {
                // Editar embarcação existente
                console.log('Atualizando embarcação ID:', embarcacaoEditando.ID_embarcacao)
                const response = await api.atualizarEmbarcacao(embarcacaoEditando.ID_embarcacao, dadosEnvio)
                console.log('Resposta da atualização:', response)
                setSucesso('Embarcação atualizada com sucesso!')
            } else {
                // Criar nova embarcação
                console.log('Criando nova embarcação')
                const response = await api.criarEmbarcacao(dadosEnvio)
                console.log('Resposta da criação:', response)
                setSucesso('Embarcação criada com sucesso!')
            }

            console.groupEnd()
            
            fecharModal()
            carregarEmbarcacoes()
        } catch (error) {
            console.error('[Embarcacoes] Erro ao salvar embarcação:', error)
            console.error('[Embarcacoes] Contexto do erro ao salvar:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                payload: dadosEnvio,
                modo: embarcacaoEditando ? 'update' : 'create'
            })
            console.groupEnd()
            setErro('Erro ao salvar embarcação: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const excluirEmbarcacao = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta embarcação?')) {
            return
        }

        try {
            console.groupCollapsed('[Embarcacoes] excluirEmbarcacao')
            console.log('ID solicitado para exclusão:', id)
            await api.excluirEmbarcacao(id)
            console.log('Exclusão concluída com sucesso')
            console.groupEnd()
            setSucesso('Embarcação excluída com sucesso!')
            carregarEmbarcacoes()
        } catch (error) {
            console.error('[Embarcacoes] Erro ao excluir embarcação:', error)
            console.error('[Embarcacoes] Contexto do erro ao excluir:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                id
            })
            console.groupEnd()
            setErro('Erro ao excluir embarcação: ' + (error.message || 'Erro desconhecido'))
        }
    }

    const embarcacoesFiltradas = embarcacoes.filter((embarcacao) => {
        const textoBusca = busca.toLowerCase();
        const municipioDaEmbarcacao = (embarcacao.municipio || '').toLowerCase();
        const municipioSelecionadoId = String(municipioFiltro).trim();

        const bateBusca =
            embarcacao.nome_embarcacao?.toLowerCase().includes(textoBusca) ||
            embarcacao.codigo_embarcacao?.toLowerCase().includes(textoBusca) ||
            embarcacao.proprietario?.toLowerCase().includes(textoBusca) ||
            embarcacao.tipo?.toLowerCase().includes(textoBusca) ||
            municipioDaEmbarcacao.includes(textoBusca);

        const bateMunicipio = !municipioSelecionadoId || String(embarcacao.ID_municipio || '').trim() === municipioSelecionadoId;

        return bateBusca && bateMunicipio;
    })
    const mostrarPaginacao = embarcacoesFiltradas.length > ITENS_POR_PAGINA
    const totalPaginas = Math.max(1, Math.ceil(embarcacoesFiltradas.length / ITENS_POR_PAGINA))
    const paginaSegura = Math.min(paginaAtual, totalPaginas)
    const indiceInicial = (paginaSegura - 1) * ITENS_POR_PAGINA
    const embarcacoesExibidas = embarcacoesFiltradas.slice(indiceInicial, indiceInicial + ITENS_POR_PAGINA)

    useEffect(() => {
        setPaginaAtual(1)
    }, [busca, municipioFiltro])

    useEffect(() => {
        setPaginaAtual((current) => Math.min(current, totalPaginas))
    }, [totalPaginas])

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 text-black hover:text-black/80"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-black">Gerenciar Embarcações</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin/embarcacoes/importar')}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Importar XLSX/CSV
                        </button>
                        <button
                            onClick={() => abrirModal()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Nova Embarcação
                        </button>
                    </div>
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
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar embarcações por nome, código, proprietário, tipo ou município..."
                        className="w-full max-w-md p-3 border rounded-lg text-black placeholder:text-gray-500"
                    />
                    <select
                        value={municipioFiltro}
                        onChange={(e) => setMunicipioFiltro(e.target.value)}
                        className="w-full max-w-md p-3 border rounded-lg text-black"
                    >
                        <option value="">Todos os municípios</option>
                        {municipios.map((municipio) => (
                            <option key={municipio.ID_municipio || municipio.municipio} value={municipio.ID_municipio || municipio.municipio}>
                                {municipio.municipio}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de Embarcações */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-black">Carregando embarcações...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {mostrarPaginacao && (
                            <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600">
                                    Mostrando {indiceInicial + 1}-{Math.min(indiceInicial + ITENS_POR_PAGINA, embarcacoesFiltradas.length)} de {embarcacoesFiltradas.length} embarcações
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((current) => Math.max(1, current - 1))}
                                        disabled={paginaSegura <= 1}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Página {paginaSegura} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((current) => Math.min(totalPaginas, current + 1))}
                                        disabled={paginaSegura >= totalPaginas}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                            Proprietário
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                            Comprimento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                            HP
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {embarcacoesExibidas.map((embarcacao) => (
                                        <tr key={embarcacao.ID_embarcacao} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                                {embarcacao.nome_embarcacao}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                {embarcacao.codigo_embarcacao}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                {embarcacao.proprietario}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                {embarcacao.tipo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                {embarcacao.comprimento ? `${embarcacao.comprimento}m` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
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

                        {mostrarPaginacao && (
                            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600">
                                    Mostrando {indiceInicial + 1}-{Math.min(indiceInicial + ITENS_POR_PAGINA, embarcacoesFiltradas.length)} de {embarcacoesFiltradas.length} embarcações
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((current) => Math.max(1, current - 1))}
                                        disabled={paginaSegura <= 1}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Página {paginaSegura} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPaginaAtual((current) => Math.min(totalPaginas, current + 1))}
                                        disabled={paginaSegura >= totalPaginas}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}

                        {embarcacoesFiltradas.length === 0 && (
                            <div className="text-center py-8 text-black">
                                {busca ? 'Nenhuma embarcação encontrada para a busca.' : 'Nenhuma embarcação cadastrada.'}
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
                            {embarcacaoEditando ? 'Editar Embarcação' : 'Nova Embarcação'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Nome da Embarcação *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome_embarcacao}
                                        onChange={(e) => setFormData({...formData, nome_embarcacao: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Código da Embarcação (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo_embarcacao}
                                        onChange={(e) => setFormData({...formData, codigo_embarcacao: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black placeholder:text-gray-500"
                                        placeholder="Ex: JP-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Proprietário (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.proprietario}
                                        onChange={(e) => setFormData({...formData, proprietario: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Apelido do Proprietário
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.apelido_propietario}
                                        onChange={(e) => setFormData({...formData, apelido_propietario: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black placeholder:text-gray-500"
                                        placeholder="Ex: Zé do Mar"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Município da Embarcação
                                    </label>
                                    <select
                                        value={formData.municipio}
                                        onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black"
                                    >
                                        <option value="">Selecione o município</option>
                                        {formData.municipio && !municipios.some((municipio) => municipio.municipio === formData.municipio) && (
                                            <option value={formData.municipio}>{formData.municipio}</option>
                                        )}
                                        {municipios.map((municipio) => (
                                            <option key={municipio.ID_municipio || municipio.municipio} value={municipio.municipio}>
                                                {municipio.municipio}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({...formData, tipo: e.target.value, tipo_outro: e.target.value === 'outro' ? formData.tipo_outro : ''})}
                                        className="w-full p-2 border rounded-lg text-black"
                                        required
                                    >
                                        <option value="">Selecione o tipo</option>
                                        <option value="catraia">Catraia</option>
                                        <option value="caico">Caico</option>
                                        <option value="jangada">Jangada</option>
                                        <option value="bote">Bote</option>
                                        <option value="lancha">Lancha</option>
                                        <option value="canoa">Canoa</option>
                                        <option value="barco">Barco</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                    {formData.tipo === 'outro' && (
                                        <input
                                            type="text"
                                            value={formData.tipo_outro}
                                            onChange={(e) => setFormData({...formData, tipo_outro: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black placeholder:text-gray-500 mt-2"
                                            placeholder="Informe o tipo da embarcação"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Comprimento (metros)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.comprimento}
                                        onChange={(e) => setFormData({...formData, comprimento: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black placeholder:text-gray-500"
                                        placeholder="Ex: 8.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Capacidade de Estocagem (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.capacidade}
                                        onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black placeholder:text-gray-500"
                                        placeholder="Ex: 500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Força do Motor (HP)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.hp}
                                        onChange={(e) => setFormData({...formData, hp: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black placeholder:text-gray-500"
                                        placeholder="Ex: 6,5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Armazenamento
                                    </label>
                                    <select
                                        value={formData.possui}
                                        onChange={(e) => setFormData({...formData, possui: e.target.value})}
                                        className="w-full p-2 border rounded-lg text-black"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="caixaTermica">Caixa Térmica</option>
                                        <option value="urna">Urna</option>
                                        <option value="pescadoInNatura">Pescado In Natura</option>
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