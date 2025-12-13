'use client'

import { useState } from 'react'
import { useFormContext } from '@/app/contexts/FormContext'

export default function Step4ArtesPesca({ nextStep, prevStep }) {
  const { formData, updateFormData } = useFormContext()
  
  // Initialize artes list from formData or empty array
  const [artesList, setArtesList] = useState(
    formData.arteSelecionadas || [{ arte: '', tamanho: '' }]
  )

  const tiposArte = [
    { value: 'rede_boirea', label: 'Rede Boiréia' },
    { value: 'espinhel_mergulho', label: 'Espinhel/Mergulho' },
    { value: 'rede_fundeio', label: 'Rede Fundeio' },
    { value: 'linha_mao', label: 'Linha de Mão' },
    { value: 'rede_cacoaria', label: 'Rede Cacoaria' },
    { value: 'covo', label: 'Covo' },
    { value: 'outras', label: 'Outras' }
  ]

  const handleAddArte = () => {
    setArtesList([...artesList, { arte: '', tamanho: '' }])
  }

  const handleRemoveArte = (index) => {
    const newList = artesList.filter((_, i) => i !== index)
    setArtesList(newList)
  }

  const handleArteChange = (index, field, value) => {
    const newList = [...artesList]
    newList[index] = { ...newList[index], [field]: value }
    setArtesList(newList)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // // Validate at least one arte is fully filled
    // const hasValidArte = artesList.some(item => 
    //   item.arte && item.tamanho && item.tamanho > 0
    // )

    // if (!hasValidArte) {
    //   alert('Por favor, adicione pelo menos uma arte de pesca com tamanho válido.')
    //   return
    // }

    // Save to form context
    updateFormData({ arteSelecionadas: artesList })
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-2xl mx-auto">
      <div className="card">
        <h2 className="heading-secondary">
          Artes de Pesca
        </h2>

        <div className="space-y-4">
          {artesList.map((arte, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center border-b pb-4 border-gray-200">
              <div className="flex-1">
                <label className="label-standard">
                  Arte *
                </label>
                <select
                  value={arte.arte}
                  onChange={(e) => handleArteChange(index, 'arte', e.target.value)}
                  className="select-standard"
                  required
                >
                  <option value="">Selecione uma arte</option>
                  {tiposArte.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="label-standard">
                  Tamanho (m) 
                </label>
                <input
                  type="number"
                  value={arte.tamanho}
                  onChange={(e) => handleArteChange(index, 'tamanho', e.target.value)}
                  min="0"
                  step="0.1"
                  className="input-standard"
                />
              </div>

              {artesList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArte(index)}
                  className="mt-4 md:mt-0 p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddArte}
            className="btn-outline w-full"
          >
            + Adicionar Arte de Pesca
          </button>
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary"
        >
          &lt; Voltar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Próximo &gt;
        </button>
      </div>
    </form>
  )
}