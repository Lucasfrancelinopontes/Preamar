'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from '@/app/contexts/FormContext'
import api from '@/services/api'

export default function Step7Especies({ nextStep, prevStep }) {
  const { formData, updateFormData } = useFormContext()
  
  // Initialize especies list from formData or with one empty entry
  const [especies, setEspecies] = useState(
    formData.especiesCapturadas || [{ id: '', peso: '', preco: '', comprimento: '' }]
  )
  const [especiesDisponiveis, setEspeciesDisponiveis] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  // Load available species from API
  useEffect(() => {
    const carregarEspecies = async () => {
      try {
        setLoading(true)
        const data = await api.getEspecies()
        setEspeciesDisponiveis(data)
      } catch (err) {
        console.error('Erro ao carregar espécies:', err)
        setErro('Erro ao carregar lista de espécies. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    carregarEspecies()
  }, [])

  const adicionarEspecie = () => {
    setEspecies([...especies, { id: '', peso: '', preco: '', comprimento: '' }])
  }

  const removerEspecie = (index) => {
    if (especies.length > 1) {
      setEspecies(especies.filter((_, i) => i !== index))
    }
  }

  const atualizarEspecie = (index, field, value) => {
    const novaLista = [...especies]
    novaLista[index] = { ...novaLista[index], [field]: value }
    setEspecies(novaLista)
  }

  const validarEspecies = () => {
    // Filter only filled species
    const especiesPreenchidas = especies.filter(e => e.id)
    
    if (especiesPreenchidas.length === 0) {
      setErro('Adicione pelo menos uma espécie capturada')
      return false
    }

    setErro(null)
    return true
  }

  const calcularTotal = () => {
    return especies
      .filter(e => e.peso && e.preco)
      .reduce((total, e) => total + (parseFloat(e.peso) * parseFloat(e.preco)), 0)
      .toFixed(2)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validarEspecies()) {
      return
    }

    // Save to form context
    updateFormData({ especiesCapturadas: especies })
    nextStep()
  }

  const handleVoltar = () => {
    // Save current state before going back
    updateFormData({ especiesCapturadas: especies })
    prevStep()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Espécies & pesagens
        </h2>

        {/* Informação sobre múltiplas espécies */}
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-700 dark:text-green-300 text-sm">
            ✅ Você pode adicionar quantas espécies quiser! Use o botão "+ Adicionar Espécie" no final da lista.
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-700 dark:text-red-300 text-sm">{erro}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando espécies...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header - Hidden on mobile, visible on desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 font-medium text-sm text-gray-700 dark:text-gray-300 pb-2 border-b dark:border-gray-700">
              <div className="col-span-4">Espécie *</div>
              <div className="col-span-2">Peso (kg) </div>
              <div className="col-span-2">Preço/kg (R$) </div>
              <div className="col-span-3">Comprimento (cm)</div>
              <div className="col-span-1"></div>
            </div>

            {/* Species List */}
            {especies.map((especie, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-0 border md:border-0 rounded-md md:rounded-none dark:border-gray-700"
              >
                {/* Espécie Select */}
                <div className="md:col-span-4">
                  <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espécie *
                  </label>
                  <select
                    value={especie.id}
                    onChange={(e) => atualizarEspecie(index, 'id', e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Selecione uma espécie</option>
                    {especiesDisponiveis.map((esp) => (
                      <option key={`${index}-${esp.ID}`} value={esp.ID}>
                        {esp.Nome_popular} ({esp.Nome_cientifico})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Peso Input */}
                <div className="md:col-span-2">
                  <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Peso (kg) 
                  </label>
                  <input
                    type="number"
                    value={especie.peso}
                    onChange={(e) => atualizarEspecie(index, 'peso', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Preço Input */}
                <div className="md:col-span-2">
                  <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço/kg (R$) 
                  </label>
                  <input
                    type="number"
                    value={especie.preco}
                    onChange={(e) => atualizarEspecie(index, 'preco', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Comprimento Input */}
                <div className="md:col-span-3">
                  <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comprimento (cm)
                  </label>
                  <input
                    type="number"
                    value={especie.comprimento}
                    onChange={(e) => atualizarEspecie(index, 'comprimento', e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="Ex: 25.5"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex items-end md:items-center justify-end">
                  {especies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerEspecie(index)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Remover espécie"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Button */}
            <button
              type="button"
              onClick={adicionarEspecie}
              className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Espécie
            </button>

            {/* Total */}
            {especies.some(e => e.peso && e.preco) && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    Total da Captura:
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    R$ {calcularTotal()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={handleVoltar}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          &lt; Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Próximo &gt;
        </button>
      </div>
    </form>
  )
}