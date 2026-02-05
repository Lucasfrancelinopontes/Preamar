'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from '@/app/contexts/FormContext'
import api from '@/services/api'

export default function Step8EspeciesIndividuos({ nextStep, prevStep }) {
  const { formData, updateFormData } = useFormContext()

  const makeTempId = (prefix = 'tmp') => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
  
  const [especiesIndividuos, setEspeciesIndividuos] = useState(
    formData.especiesIndividuos || []
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

  const adicionarIndividuo = (especieIndex) => {
    const novaLista = [...especiesIndividuos]
    if (!novaLista[especieIndex].individuos) {
      novaLista[especieIndex].individuos = []
    }
    novaLista[especieIndex].individuos.push({ id_temporario: makeTempId('individuo'), peso: '', comprimento: '' })
    setEspeciesIndividuos(novaLista)
  }

  const removerIndividuo = (especieIndex, individuoIndex) => {
    const novaLista = [...especiesIndividuos]
    novaLista[especieIndex].individuos = novaLista[especieIndex].individuos.filter((_, i) => i !== individuoIndex)
    setEspeciesIndividuos(novaLista)
  }

  const atualizarIndividuo = (especieIndex, individuoIndex, field, value) => {
    const novaLista = [...especiesIndividuos]
    if (!novaLista[especieIndex].individuos) {
      novaLista[especieIndex].individuos = []
    }
    if (!novaLista[especieIndex].individuos[individuoIndex]) {
      novaLista[especieIndex].individuos[individuoIndex] = { id_temporario: makeTempId('individuo') }
    }

    if (!novaLista[especieIndex].individuos[individuoIndex].id_temporario) {
      novaLista[especieIndex].individuos[individuoIndex].id_temporario = makeTempId('individuo')
    }
    
    // Validação em tempo real para peso
    if (field === 'peso' && value) {
      const pesoNum = parseFloat(value)
      const PESO_MAXIMO_G = 1000000 // 1 tonelada = 1.000kg = 1.000.000g (limite razoável para pesca artesanal)
      
      if (pesoNum < 0) {
        setErro('Peso não pode ser negativo')
        return
      }
      if (pesoNum > PESO_MAXIMO_G) {
        setErro(`Peso muito alto! Máximo permitido: ${PESO_MAXIMO_G.toLocaleString('pt-BR')}g (1 tonelada)`)
        return
      }
    }
    
    // Validação em tempo real para comprimento
    if (field === 'comprimento' && value) {
      const compNum = parseFloat(value)
      const COMPRIMENTO_MAXIMO_CM = 500 // 5 metros (limite razoável para peixes)
      
      if (compNum < 0) {
        setErro('Comprimento não pode ser negativo')
        return
      }
      if (compNum > COMPRIMENTO_MAXIMO_CM) {
        setErro(`Comprimento muito alto! Máximo permitido: ${COMPRIMENTO_MAXIMO_CM}cm (5 metros)`)
        return
      }
    }
    
    setErro(null)
    novaLista[especieIndex].individuos[individuoIndex][field] = value
    setEspeciesIndividuos(novaLista)
  }

  const validarIndividuos = () => {
    const PESO_MAXIMO_G = 1000000 // 1 tonelada
    const COMPRIMENTO_MAXIMO_CM = 500 // 5 metros
    
    for (const especie of especiesIndividuos) {
      if (especie.individuos && especie.individuos.length > 0) {
        for (const individuo of especie.individuos) {
          // Validar peso
          if (individuo.peso) {
            const peso = parseFloat(individuo.peso)
            if (peso <= 0) {
              setErro('Peso do indivíduo deve ser maior que zero')
              return false
            }
            if (peso > PESO_MAXIMO_G) {
              setErro(`Peso inválido ou muito alto! Máximo: ${PESO_MAXIMO_G.toLocaleString('pt-BR')}g (1 tonelada)`)
              return false
            }
          }
          
          // Validar comprimento
          if (individuo.comprimento) {
            const comp = parseFloat(individuo.comprimento)
            if (comp <= 0) {
              setErro('Comprimento do indivíduo deve ser maior que zero')
              return false
            }
            if (comp > COMPRIMENTO_MAXIMO_CM) {
              setErro(`Comprimento muito alto! Máximo: ${COMPRIMENTO_MAXIMO_CM}cm (5 metros)`)
              return false
            }
          }
        }
      }
    }

    setErro(null)
    return true
  }

  const obterNomeEspecie = (id) => {
    const especie = especiesDisponiveis.find(e => e.ID == id)
    return especie ? `${especie.Nome_popular} (${especie.Nome_cientifico})` : ''
  }

  const calcularPesoTotalIndividuos = (individuos) => {
    if (!individuos || individuos.length === 0) return 0
    return individuos
      .filter(i => i.peso)
      .reduce((total, i) => total + parseFloat(i.peso), 0)
      .toFixed(0) // em gramas
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validarIndividuos()) {
      return
    }

    // Save to form context
    updateFormData({ especiesIndividuos })
    nextStep()
  }

  const handleVoltar = () => {
    // Save current state before going back
    updateFormData({ especiesIndividuos })
    prevStep()
  }

  const pularEtapa = () => {
    // Allow user to skip individual data entry
    nextStep()
  }

  return (
    <div className="space-y-8 p-4 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Dados Individuais dos Peixes - Etapa 2
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Para cada espécie capturada, você pode adicionar dados individuais dos peixes (peso em gramas e comprimento em cm). 
          Esta etapa é opcional e pode ser pulada se não tiver esses dados.
        </p>

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
          <div className="space-y-8">
            {especiesIndividuos.map((especie, especieIndex) => (
              <div key={especie.id_temporario || especieIndex} className="border dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
                  {obterNomeEspecie(especie.id)}
                </h3>
                
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Peso total da espécie: <span className="font-medium">{especie.peso} kg</span></p>
                  <p>Condição: <span className="font-medium">{especie.comTripa ? 'Com tripa' : 'Sem tripa'}</span></p>
                </div>

                {/* Table Header for Individuals */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 font-medium text-sm text-gray-700 dark:text-gray-300 pb-2 border-b dark:border-gray-600 mb-4">
                  <div className="col-span-5">Comprimento (cm)</div>
                  <div className="col-span-5">Peso Individual (g)</div>
                  <div className="col-span-2"></div>
                </div>

                {/* Individuals List */}
                {especie.individuos && especie.individuos.map((individuo, individuoIndex) => (
                  <div
                    key={individuo.id_temporario || individuoIndex}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-3 md:p-0 border md:border-0 rounded-md md:rounded-none dark:border-gray-600 mb-4 md:mb-2"
                  >
                    {/* Comprimento */}
                    <div className="md:col-span-5">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Comprimento (cm)
                      </label>
                      <input
                        type="number"
                        value={individuo.comprimento || ''}
                        onChange={(e) => atualizarIndividuo(especieIndex, individuoIndex, 'comprimento', e.target.value)}
                        min="0"
                        max="500"
                        step="0.1"
                        placeholder="Ex: 25.5 (máx: 500cm)"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        title="Comprimento em centímetros. Máximo: 500cm (5 metros)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Máx: 500cm (5m)
                      </p>
                    </div>

                    {/* Peso Individual */}
                    <div className="md:col-span-5">
                      <label className="block md:hidden text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Peso Individual (g)
                      </label>
                      <input
                        type="number"
                        value={individuo.peso || ''}
                        onChange={(e) => atualizarIndividuo(especieIndex, individuoIndex, 'peso', e.target.value)}
                        min="0"
                        max="1000000"
                        step="1"
                        placeholder="Ex: 250 (máx: 1.000.000g)"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        title="Peso em gramas. Máximo: 1.000.000g (1 tonelada)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Máx: 1.000.000g (1 ton)
                      </p>
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-2 flex items-end md:items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removerIndividuo(especieIndex, individuoIndex)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remover indivíduo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Individual Button */}
                <button
                  type="button"
                  onClick={() => adicionarIndividuo(especieIndex)}
                  className="w-full mt-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Indivíduo
                </button>

                {/* Summary for this species */}
                {especie.individuos && especie.individuos.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        Total de indivíduos: {especie.individuos.length}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Peso total medido: {calcularPesoTotalIndividuos(especie.individuos)}g
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {especiesIndividuos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma espécie foi definida na etapa anterior.
                <br />
                Volte para definir as espécies capturadas.
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
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={pularEtapa}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Pular Etapa
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Próximo &gt;
          </button>
        </div>
      </div>
    </div>
  )
}